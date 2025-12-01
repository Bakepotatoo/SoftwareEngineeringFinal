// Register a new user
export async function handleRegister(formValues, deps) {
  // Get input values
  const { email, password, username, confirmPassword } = formValues;

  // Get dependencies
  const { auth, createUserWithEmailAndPassword, addUserToFirestore, alertFn, redirectFn } = deps;

  // Stop if passwords don't match
  if (password !== confirmPassword) {
    alertFn("Passwords do not match. Please enter the same passwords in both fields.");
    return;
  }

  // Create the user
  const userCredential = await createUserWithEmailAndPassword(
    auth, 
    email, 
    password
  );

  // Get the user object
  const user = userCredential.user;

  // Show success message
  alertFn("Your account has been created!");

  // Add user to Firestore
  await addUserToFirestore(user.uid, username, email);

  // Go to profile page
  redirectFn("launcherone_profile.html");
}

//Previous

// import { register } from "../public/js/loginFunctionality.js";
// import { createUserWithEmailAndPassword } from "firebase/auth";

// basic mock
// jest.mock("firebase/auth", () => ({
//   createUserWithEmailAndPassword: jest.fn(),
// }));

// describe("Basic register test", () => {
//   beforeEach(() => {
//     document.body.innerHTML = `
//       <input id="email" value="test@example.com"/>
//       <input id="password" value="password123"/>
//       <input id="confirmPassword" value="password123"/>
//       <button id="signUpButton"></button>
//     `;
//   });

//   it("should call Firebase to create user", () => {
//     const btn = document.querySelector("#signUpButton");
//     btn.addEventListener("click", register);
//     btn.click();

// 
//     expect(createUserWithEmailAndPassword).toHaveBeenCalled();
//   });

//   it("should alert if passwords don't match", () => {
//     const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
//     document.querySelector("#confirmPassword").value = "wrong";

//     const btn = document.querySelector("#signUpButton");
//     btn.addEventListener("click", register);
//     btn.click();

//  
//     expect(alertMock).toHaveBeenCalled();
//   });
// });