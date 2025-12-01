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

// Listen for changes in authentication state
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    console.log("No user signed in");
    // optionally: window.location.href = "launcherone_login.html";
    return;
  }

  // show their email
  const usernameElement = document.getElementById("emailValue");
  if (usernameElement) {
    usernameElement.innerText = user.email;
  }

  // load profile from Firestore
  try {
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const data = userSnap.data();

      // put values into inputs
      $("#name").val(data.name || "");
      $("#bio").val(data.bio || "");
      $("#age").val(data.age || "");
      $("#university-year").val(data.universityYear || "");
      $("#gender").val(data.gender || "");
      $("#roommate-preference").val(data.roommatePreference || "");
      $("#location").val(data.location || "");
      $("#pet-friendly").val(data.petFriendly || "");
      $("#accommodation-type").val(data.accommodationType || "");
      $("#student-status").val(data.studentStatus || "");
      $("#minBudget").val(data.minBudget || "");
      $("#maxBudget").val(data.maxBudget || "");
      if (data.profileImageUrl) {
        $("#profile-image-preview").attr("src", data.profileImageUrl);
      }

      // and into display text elements
      $("#headNameValue").text(data.name || "");
      $("#name-value").text(data.name || "");
      $("#bio-value").text(data.bio || "");
      $("#age-value").text(data.age || "");
      $("#year-value").text(data.universityYear || "");
      $("#gender-value").text(data.gender || "");
      $("#roommate-value").text(data.roommatePreference || "");
      $("#location-value").text(data.location || "");
      $("#pet-value").text(data.petFriendly || "");
      $("#accomm-value").text(data.accommodationType || "");
      $("#student-value").text(data.studentStatus || "");
      $("#minBudget-value").text(data.minBudget || "");
      $("#maxBudget-value").text(data.maxBudget || "");

      // show "view mode" by default
      profileInputs.forEach((input) => (input.style.display = "none"));
      profileValues.forEach((value) => (value.style.display = "inline"));
      saveButton.style.display = "none";
      editProfileButton.style.display = "block";
      document.querySelector(".profile-links").style.display = "block";

      //users who already have a profile are going to go straight to the matches page

      if (userSnap.exists() && userSnap.data().profileCompleted === true) {
        window.location.href = "launcherone_matches.html";
      }
    } else {
      console.log("No profile yet – show edit mode");
      // show edit mode (so they can fill profile the first time)
      profileInputs.forEach((input) => (input.style.display = "inline"));
      profileValues.forEach((value) => (value.style.display = "none"));
      saveButton.style.display = "block";
      editProfileButton.style.display = "none";
      document.querySelector(".profile-links").style.display = "none";
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
});

var profileInputs = document.querySelectorAll(".profile-input");
var profileValues = document.querySelectorAll(".profile-info-value");
var saveButton = document.querySelector(".saveButton");
var editProfileButton = document.querySelector(".edit-profile-btn");

const savePref = async () => {
  var user = auth.currentUser;

  if (!user) {
    alert("You must be logged in to save your profile.");
    return;
  }

  var name = $("#name").val();
  var bio = $("#bio").val();
  var age = $("#age").val();
  var universityYear = $("#university-year").val();
  var gender = $("#gender").val();
  var roommatePreference = $("#roommate-preference").val();
  var location = $("#location").val();
  var petFriendly = $("#pet-friendly").val();
  var accommodationType = $("#accommodation-type").val();
  var studentStatus = $("#student-status").val();
  var minBudget = $("#minBudget").val();
  var maxBudget = $("#maxBudget").val();
  var profileImageUrl = $("#profile-image-preview").attr("src");

  $(document).ready(function () {
    // Retrieve values from input fields

    // Set innerHTML of corresponding elements
    $("#headNameValue").text(name);
    $("#name-value").text(name);
    $("#bio-value").text(bio);
    $("#age-value").text(age);
    $("#year-value").text(universityYear);
    $("#gender-value").text(gender);
    $("#roommate-value").text(roommatePreference);
    $("#location-value").text(location);
    $("#pet-value").text(petFriendly);
    $("#accomm-value").text(accommodationType);
    $("#student-value").text(studentStatus);
    $("#minBudget-value").text(minBudget);
    $("#maxBudget-value").text(maxBudget);
  });

  // Check if any of the input fields are empty
  if (
    !name ||
    !bio ||
    !age ||
    !universityYear ||
    !gender ||
    !roommatePreference ||
    !location ||
    !petFriendly ||
    !accommodationType ||
    !studentStatus ||
    !minBudget ||
    !maxBudget
  ) {
    // If any field is empty, show an alert and return early
    alert("Please fill in all input fields.");
    return;
  }

  // Create a reference to the user's profile in the database
  var userRef = ref(database, "users/" + user.uid);

  //save to Firestore under users/{uid}
  try {
    await setDoc(
      doc(db, "users", user.uid),
      {
        name: name,
        bio: bio,
        age: age,
        universityYear: universityYear,
        gender: gender,
        roommatePreference: roommatePreference,
        location: location,
        petFriendly: petFriendly,
        accommodationType: accommodationType,
        studentStatus: studentStatus,
        minBudget: minBudget,
        maxBudget: maxBudget,
        profileImageUrl: profileImageUrl,
        profileCompleted: true, // useful flag
      },
      { merge: true } // don't wipe other fields
    );
    console.log("Profile saved successfully");
  } catch (error) {
    console.error("Error saving profile:", error);
  }
};

saveButton.addEventListener("click", savePref);

document.getElementById("seeMatchesButton").addEventListener("click", () => {
  window.location.href = "launcherone_matches.html";
});

window.location.href = "launcherone_matches.html";

function previewProfilePicture(event) {
  var reader = new FileReader();
  reader.onload = function () {
    var output = document.getElementById("profile-image-preview");
    output.src = reader.result;
  };
  reader.readAsDataURL(event.target.files[0]);
}
