// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// App's firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdneNSullE_FsSHc17pXxbr5SWxu-OFjw",
  authDomain: "software-engineering-43ebc.firebaseapp.com",
  projectId: "software-engineering-43ebc",
  storageBucket: "software-engineering-43ebc.firebasestorage.app",
  messagingSenderId: "911495284634",
  appId: "1:911495284634:web:b1ecdbf65eebead0365c23",
  measurementId: "G-RJ43F0SQG5",
};

// Importing functions for functionality in login page
import {
  decidePostLoginRoute,
  validateLoginInputs,
} from "./loginFunctionality.js";

// Initialize Firebase in the app
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

const userEmail = document.querySelector("#logInEmail");
const userPassword = document.querySelector("#logInPassword");
const authForm = document.querySelector("#logInForm");
const signInButton = document.querySelector("#logInButton");

const logIn = async (event) => {
  event.preventDefault();

  const logInEmail = userEmail.value;
  const logInPassword = userPassword.value;

  const { isValid, errors } = validateLoginInputs(logInEmail, logInPassword);
  if (!isValid) {
    alert("Please fill in: " + errors.join(", "));
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      logInEmail,
      logInPassword
    );
    const user = userCredential.user;

    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);
    const data = userSnap.exists() ? userSnap.data() : null;

    const route = decidePostLoginRoute(data);
    window.location.href = route;
  } catch (error) {
    console.error("Login error:", error);
    alert("Login unsuccessful. Please try again.");
  }
};

// const logIn = async (event) => {
//   event.preventDefault();

//   const logInEmail = userEmail.value;
//   const logInPassword = userPassword.value;

//   try {
//     const userCredential = await signInWithEmailAndPassword(
//       auth,
//       logInEmail,
//       logInPassword
//     );
//     const user = userCredential.user;

//     // check Firestore to decide where to go
//     const userDocRef = doc(db, "users", user.uid);
//     const userSnap = await getDoc(userDocRef);

//     if (userSnap.exists() && userSnap.data().profileCompleted == true) {
//       // profile is complete → go to matches
//       window.location.href = "launcherone_matches.html";
//     } else {
//       // no profile or not complete → go to profile page
//       window.location.href = "launcherone_profile.html";
//     }
//   } catch (error) {
//     console.error("Login error: ", error);
//     alert("Login unsuccessful. Please try again.");
//   }
// };

// if (authForm) {
//   authForm.addEventListener("submit", logIn);
// }

// const logIn = async () => {
//   const logInEmail = userEmail.value;
//   const logInPassword = userPassword.value;

//   //sign in function to log in an already existing user into their account
//   signInWithEmailAndPassword(auth, logInEmail, logInPassword)
//     .then((userCredential) => {
//       try {
//       const userCredential = await signInWithEmailAndPassword(
//         auth,
//         logInEmail,
//         logInPassword
//       );
//       const user = userCredential.user;
//       console.log("You have signed in successfully", user);
//       alert("You have successfully logged in");

//       const userDocRef = doc(db, "users", user.uid);
//       const userSnap = await getDoc(userDocRef);

//       //redirects the user to the next page upon successful login
//       if (userSnap.exists() && userSnap.data().profileCompleted) {
//         // profile is complete → go to matches
//         window.location.href = "launcherone_matches.html";
//       } else {
//         // no profile or not complete → go to profile page
//         window.location.href = "launcherone_profile.html";
//       }

//     }

//     }
//     catch((error) => {
//       console.error("Login error: " + error.message);

//       //displays a message that the login was unsuccessful
//       alert("Login unsuccessful. Please try again.");

//       //checks if the error is due to user not found
//       if (errorCode === "auth-user-not-found") {
//         //alerts the user that the email entered is incorrect
//         alert("Email not found. Please enter a valid email!");
//       } else {
//         alert(error.message);
//       }

//     });

//};

//runs the above sign in function if the log in button is clicked on
signInButton.addEventListener("click", logIn);
