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

// // Import the functions you need from the SDKs you need
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
// import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
// import {
//   getDatabase,
//   ref,
//   onValue,
//   remove,
// } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyCBY5xCnq3BMN__V6bLR6ZpUJS5UoQRbVU",
//   authDomain: "roommate-match-making.firebaseapp.com",
//   databaseURL: "https://roommate-match-making-default-rtdb.firebaseio.com",
//   projectId: "roommate-match-making",
//   storageBucket: "roommate-match-making.appspot.com",
//   messagingSenderId: "1086011648278",
//   appId: "1:1086011648278:web:a37275f476af35c2fc8837",
//   measurementId: "G-03Y8JYTZS5",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const database = getDatabase();

// var name;
// var profile;

// // Listen for changes in authentication state
// auth.onAuthStateChanged((user) => {
//   if (user) {
//     // Create a reference to the user's profile in the database
//     const userRef = ref(database, "users/" + user.uid);

//     onValue(
//       userRef,
//       (snapshot) => {
//         if (snapshot.exists()) {
//           const userData = snapshot.val();
//           // Get roommatePreference and preferredLocation of the current user
//           const { roommatePreference, preferredLocation } = userData;

//           // Query all users
//           const usersRef = ref(database, "users");

//           onValue(
//             usersRef,
//             (snapshot) => {
//               if (snapshot.exists()) {
//                 const allUsers = snapshot.val();

//                 // Filter other users based on roommatePreference and preferredLocation
//                 Object.keys(allUsers).forEach((userId) => {
//                   const otherUser = allUsers[userId];
//                   if (
//                     otherUser.roommatePreference === roommatePreference &&
//                     otherUser.preferredLocation === preferredLocation &&
//                     userId !== user.uid
//                   ) {
//                     //console.log("Found a match:", otherUser);

//                     // Inject other user's data into profile elements
//                     document.getElementById("profile-name").innerHTML =
//                       otherUser.name;
//                     name = otherUser.name;
//                     document.getElementById("profile-bio").innerHTML =
//                       otherUser.bio;
//                     document.getElementById(
//                       "profile-roommate-preference"
//                     ).innerHTML =
//                       "Roommate preference: " + otherUser.roommatePreference;
//                     document.getElementById("profile-location").innerHTML =
//                       "Preferred location: " + otherUser.location;
//                     document.getElementById("profile-image").src =
//                       otherUser.profileImageUrl;
//                     profile = otherUser.profileImageUrl;
//                   }
//                 });
//               } else {
//                 console.log("No data found in the 'users' node");
//               }
//             },
//             (error) => {
//               console.error("Error retrieving users data:", error);
//             }
//           );
//         } else {
//           console.log("No data found in the 'users' node");
//         }
//       },
//       (error) => {
//         console.error("Error retrieving user data:", error);
//       }
//     );
//   } else {
//     console.log("No user signed in");
//   }
// });

// // Show the match notification
// const matchHeaderWrapper = document.querySelector(".match-header-wrapper");
// matchHeaderWrapper.style.display = "flex";

// // Hide the match notification after 2 seconds
// setTimeout(() => {
//   matchHeaderWrapper.style.display = "none";
// }, 2000);

// // Add event listener to accept button
// document.getElementById("acceptButton").addEventListener("click", function () {
//   // Code to add the other user to the chat list and redirect to chat page
//   //console.log("Accepted");
//   // Redirect to chat page

//   localStorage.setItem("name", name); //stores the name of the person taken from this page and sends it to the next page
//   localStorage.setItem("profilepic", profile);
//   window.location.href = "launcherone_chat.html";
// });

// // Add event listener to decline button
// document.querySelector(".delete-button").addEventListener("click", function () {
//   // Get the currently logged-in user's UID
//   const currentUser = auth.currentUser;
//   if (currentUser) {
//     const userUid = currentUser.uid;

//     // Reference to the match data for the current user
//     const matchRef = ref(database, `matches/${userUid}`);

//     // Remove the match data for the current user
//     remove(matchRef)
//       .then(() => {
//         console.log("Match deleted for user:", userUid);
//         // Update match header and hide match container
//         matchHeaderWrapper.style.display = "flex";
//         document.querySelector(".match-header").innerHTML =
//           "We found no matches for you";
//         setTimeout(() => {
//           matchHeaderWrapper.style.display = "none";
//         }, 2000);

//         document.querySelector(".match-container").style.display = "none";
//       })
//       .catch((error) => {
//         console.error("Error deleting match:", error);
//       });
//   } else {
//     console.log("No user signed in");
//     // Handle case where no user is signed in
//   }
// });
