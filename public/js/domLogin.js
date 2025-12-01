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

//runs the above sign in function if the log in button is clicked on
signInButton.addEventListener("click", logIn);
