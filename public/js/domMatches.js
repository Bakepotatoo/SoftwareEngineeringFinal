// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// -------------------- Firebase config (NEW PROJECT) --------------------
const firebaseConfig = {
  apiKey: "AIzaSyBdneNSullE_FsSHc17pXxbr5SWxu-OFjw",
  authDomain: "software-engineering-43ebc.firebaseapp.com",
  projectId: "software-engineering-43ebc",
  storageBucket: "software-engineering-43ebc.firebasestorage.app",
  messagingSenderId: "911495284634",
  appId: "1:911495284634:web:b1ecdbf65eebead0365c23",
  measurementId: "G-RJ43F0SQG5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Will hold the matched user's info for passing to chat page
var matchName;
var matchProfileImage;

document.addEventListener("DOMContentLoaded", () => {
  const matchHeaderWrapper = document.querySelector(".match-header-wrapper");
  const matchHeader = document.querySelector(".match-header");
  const noMatchesMsg = document.getElementById("no-matches");
  const matchContainer = document.querySelector(".match-container");
  const acceptButton = document.getElementById("acceptButton");
  const declineButton = document.querySelector(".delete-button");

  // Helper to show a temporary header message
  function showHeaderMessage(message) {
    if (!matchHeaderWrapper || !matchHeader) return;
    matchHeaderWrapper.style.display = "flex";
    matchHeader.textContent = message;
    setTimeout(() => {
      matchHeaderWrapper.style.display = "none";
    }, 2000);
  }

  // -------------------- Auth + Load Match --------------------
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.log("No user signed in on matches page");
      window.location.href = "launcherone_register.html";
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      const currentUserData = userSnap.data();

      if (!currentUserData.profileCompleted) {
        // Profile not completed yet → redirect to profile
        window.location.href = "launcherone_profile.html";
        return;
      }

      const roommatePreference = currentUserData.roommatePreference;
      const location =
        currentUserData.preferredLocation || currentUserData.location;

      if (!roommatePreference || !location) {
        console.log("Missing roommatePreference or location on profile");
        showHeaderMessage("Your profile is incomplete for matching.");
        if (matchContainer) matchContainer.style.display = "none";
        return;
      }

      // 2) Find other users with same roommatePreference + location
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("roommatePreference", "==", roommatePreference),
        where("location", "==", location) //
      );

      const querySnapshot = await getDocs(q);

      let matchFound = false;

      querySnapshot.forEach((docSnap) => {
        if (matchFound) return; // only use first match
        if (docSnap.id === user.uid) return; // skip self

        const otherUser = docSnap.data();
        matchFound = true;

        // Save for later (chat page)
        matchName = otherUser.name || "";
        matchProfileImage = otherUser.profileImageUrl || "";

        // Inject into DOM
        const nameEl = document.getElementById("profile-name");
        const bioEl = document.getElementById("profile-bio");
        const prefEl = document.getElementById("profile-roommate-preference");
        const locationEl = document.getElementById("profile-location");
        const imageEl = document.getElementById("profile-image");

        if (nameEl) nameEl.textContent = otherUser.name || "";
        if (bioEl) bioEl.textContent = otherUser.bio || "";
        if (prefEl)
          prefEl.textContent =
            "Roommate preference: " + (otherUser.roommatePreference || "");
        if (locationEl)
          locationEl.textContent =
            "Preferred location: " + (otherUser.location || "");
        if (imageEl && otherUser.profileImageUrl) {
          imageEl.src = otherUser.profileImageUrl;
        }

        if (matchContainer) matchContainer.style.display = "block";
      });

      if (matchFound) {
        showHeaderMessage("We found a match for you!");
      } else {
        console.log("No matching users found");
        showHeaderMessage("We found no matches for you");
        if (matchContainer) matchContainer.style.display = "none";
        noMatchesMsg.classList.remove("hidden");
      }
    } catch (error) {
      console.error("Error retrieving match data:", error);
      showHeaderMessage("Error loading matches. Please try again.");
    }
  });

  // -------------------- Accept match --------------------
  if (acceptButton) {
    acceptButton.addEventListener("click", () => {
      // Store match data for chat page
      if (matchName) {
        localStorage.setItem("name", matchName);
      }
      if (matchProfileImage) {
        localStorage.setItem("profilepic", matchProfileImage);
      }
      window.location.href = "launcherone_chat.html";
    });
  }

  // -------------------- Decline match --------------------
  if (declineButton) {
    declineButton.addEventListener("click", async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log("No user signed in when declining match");
        return;
      }

      try {
        const matchDocRef = doc(db, "matches", currentUser.uid);
        await deleteDoc(matchDocRef);

        console.log("Match deleted for user:", currentUser.uid);

        showHeaderMessage("We found no matches for you");
        if (matchContainer) matchContainer.style.display = "none";
        noMatchesMsg.classList.remove("hidden");
      } catch (error) {
        console.error("Error deleting match:", error);
      }
    });
  }
});
