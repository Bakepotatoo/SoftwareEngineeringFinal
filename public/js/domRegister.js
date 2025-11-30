// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
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

//reference to cloud firestore
const db = getFirestore(app);

// Initialize Firebase
//   const app = initializeApp(firebaseConfig);
//   const auth = getAuth(app);

const userEmail = document.querySelector("#email");
const userPassword = document.querySelector("#password");
const userName = document.querySelector("#username");
const passwordConfirmation = document.querySelector("#confirmPassword");
const authForm = document.querySelector("#signUpForm");
const signUpButton = document.querySelector("#signUpButton");

const register = async () => {
  const signUpEmail = userEmail.value;
  const signUpPassword = userPassword.value;
  const signUpUsername = userName.value;
  const signUpPasswordConfirmation = passwordConfirmation.value;

  if (signUpPassword != signUpPasswordConfirmation) {
    alert(
      "Passwords do not match. Please enter the same passwords in both fields."
    );
    return;
  }

  createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log(user);
      alert("Your account has been created!");

      // Firestore only
      addUserToFirestore(user.uid, signUpUsername, signUpEmail);

      // go to profile page
      window.location.href = "launcherone_profile.html";
    })
    .catch((error) => {
      console.error("Sign up error: " + error.message);
    });

  console.log("User saved to Firestore (request sent)");
};

signUpButton.addEventListener("click", register);

function addUserToFirestore(userId, username, email) {
  // store user in "users/{userId}"
  setDoc(doc(db, "users", userId), {
    username: username,
    email: email,
    createdAt: new Date(), // example extra field
  })
    .then(() => {
      console.log("User document written to Firestore with ID:", userId);
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
}
