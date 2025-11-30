/***** firebase imports *****/
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  addDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBdneNSullE_FsSHc17pXxbr5SWxu-OFjw",
  authDomain: "software-engineering-43ebc.firebaseapp.com",
  projectId: "software-engineering-43ebc",
  storageBucket: "software-engineering-43ebc.firebasestorage.app",
  messagingSenderId: "911495284634",
  appId: "1:911495284634:web:b1ecdbf65eebead0365c23",
  measurementId: "G-RJ43F0SQG5",
};

/***** INITIALIZE FIREBASE *****/
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

/***** DOM ELEMENTS *****/
const chatTitle = document.getElementById("chat-title");
const chatProfileName = document.getElementById("chat-profile-name");
const chatImage = document.getElementById("chat-image");
const chatProfileImage = document.getElementById("chat-profile-image");
const messagesContainer = document.getElementById("messages");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");

/***** STATE *****/
let currentUser = null;
let matchedUser = null;
let chatId = null; // combination of two uids
let unsubscribeMessages = null;

/***** UTILITY: BUILD CHAT ID FOR TWO USERS *****/
function getChatIdForUsers(uid1, uid2) {
  // deterministic ordering so both users compute the same chatId
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
}

/***** SET UP UI FROM LOCALSTORAGE (OPTIONAL) *****/
const storedName = localStorage.getItem("name");
const storedProfilePic = localStorage.getItem("profilepic");

if (storedName) {
  chatTitle.textContent = storedName;
  chatProfileName.textContent = storedName;
}

if (storedProfilePic) {
  chatImage.src = storedProfilePic;
  chatProfileImage.src = storedProfilePic;
}

/***** AUTH STATE LISTENER *****/
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.log("No user signed in. Redirecting to login...");
    window.location.href = "launcherone_register.html";
    return;
  }

  currentUser = user;
  console.log("Signed in as:", currentUser.uid);

  try {
    await loadCurrentUserAndMatch();
  } catch (err) {
    console.error("Error loading match:", err);
  }
});

/***** LOAD CURRENT USER + FIND MATCH *****/
async function loadCurrentUserAndMatch() {
  // Load current user's profile
  const userDocRef = doc(db, "users", currentUser.uid);
  const userSnap = await getDoc(userDocRef);

  if (!userSnap.exists()) {
    console.warn("No profile found for current user. Redirecting...");
    window.location.href = "launcherone_profile.html";
    return;
  }

  const userData = userSnap.data();
  console.log("Current user data:", userData);

  const { roommatePreference, preferredLocation } = userData;

  // Update UI with current user's saved name + image if present
  if (userData.displayName) {
    chatTitle.textContent = userData.displayName;
    chatProfileName.textContent = userData.displayName;
  }
  if (userData.profilepic) {
    chatImage.src = userData.profilepic;
    chatProfileImage.src = userData.profilepic;
  }

  // Find matches in Firestore
  const usersRef = collection(db, "users");
  const q = query(
    usersRef,
    where("roommatePreference", "==", roommatePreference),
    where("preferredLocation", "==", preferredLocation)
  );

  const querySnap = await getDocs(q);

  let foundMatch = null;

  querySnap.forEach((docSnap) => {
    if (docSnap.id !== currentUser.uid && !foundMatch) {
      foundMatch = {
        uid: docSnap.id,
        ...docSnap.data(),
      };
    }
  });

  if (!foundMatch) {
    console.log("No match found for this user.");
    chatProfileName.textContent = "No matches yet";
    chatTitle.textContent = "No matches yet";
    return;
  }

  matchedUser = foundMatch;
  console.log("Matched user:", matchedUser);

  // Update UI with matched user info
  const matchName =
    matchedUser.displayName ||
    `${matchedUser.firstName || ""} ${matchedUser.lastName || ""}`.trim() ||
    "Match";

  chatProfileName.textContent = matchName;
  chatTitle.textContent = matchName;

  if (matchedUser.profilepic) {
    chatImage.src = matchedUser.profilepic;
    chatProfileImage.src = matchedUser.profilepic;
  }

  // Compute chatId for the pair
  chatId = getChatIdForUsers(currentUser.uid, matchedUser.uid);

  // Start listening for messages between these two users
  listenForMessages();
}

/***** LISTEN FOR MESSAGES FOR THIS CHAT *****/
function listenForMessages() {
  if (!chatId) return;

  // detach old listener if any
  if (unsubscribeMessages) {
    unsubscribeMessages();
  }

  const messagesRef = collection(db, "messages");
  const q = query(
    messagesRef,
    where("chatId", "==", chatId),
    orderBy("createdAt", "asc")
  );

  unsubscribeMessages = onSnapshot(
    q,
    (snapshot) => {
      messagesContainer.innerHTML = "";

      snapshot.forEach((docSnap) => {
        const msg = docSnap.data();
        renderMessage(msg);
      });

      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
    (error) => {
      console.error("Error listening for messages:", error);
    }
  );
}

/***** rendering a single message *****/
function renderMessage(msg) {
  const isMe = msg.senderId === currentUser.uid;

  const outerDiv = document.createElement("div");
  outerDiv.classList.add("outer");
  if (isMe) {
    outerDiv.style.justifyContent = "flex-end";
  }

  const innerDiv = document.createElement("div");
  innerDiv.id = "inner";
  innerDiv.classList.add(isMe ? "me" : "otherUser");
  innerDiv.textContent = (isMe ? "You: " : "") + msg.text;

  outerDiv.appendChild(innerDiv);
  messagesContainer.appendChild(outerDiv);
}

/***** code to send messages to matched users only *****/
messageForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  await sendMessage();
});

async function sendMessage() {
  if (!currentUser || !matchedUser || !chatId) {
    console.warn("Cannot send message, missing user or match.");
    return;
  }

  const text = messageInput.value.trim();
  if (!text) return;

  const messagesRef = collection(db, "messages");

  try {
    await addDoc(messagesRef, {
      chatId,
      senderId: currentUser.uid,
      receiverId: matchedUser.uid,
      text,
      createdAt: serverTimestamp(),
    });

    messageInput.value = "";
  } catch (err) {
    console.error("Error sending message:", err);
  }
}
