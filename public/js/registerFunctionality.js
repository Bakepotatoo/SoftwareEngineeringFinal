// public/js/registerFunctionality.js

// PURE LOGIC ONLY – no firebase imports, no DOM

export async function handleRegister(formValues, deps) {
  const { email, password, username, confirmPassword } = formValues;

  const {
    auth,
    createUserWithEmailAndPassword,
    addUserToFirestore,
    alertFn,
    redirectFn,
  } = deps;

  if (password !== confirmPassword) {
    alertFn(
      "Passwords do not match. Please enter the same passwords in both fields."
    );
    return;
  }

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = userCredential.user;

  alertFn("Your account has been created!");

  await addUserToFirestore(user.uid, username, email);

  redirectFn("launcherone_profile.html");
}


// import { register } from "../public/js/loginFunctionality.js";
// import { createUserWithEmailAndPassword } from "firebase/auth";

// // VERY basic mock
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

//     // This line is incomplete / intentionally simple
//     expect(createUserWithEmailAndPassword).toHaveBeenCalled();
//   });

//   it("should alert if passwords don't match", () => {
//     const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
//     document.querySelector("#confirmPassword").value = "wrong";

//     const btn = document.querySelector("#signUpButton");
//     btn.addEventListener("click", register);
//     btn.click();

//     // This assertion is intentionally incomplete
//     expect(alertMock).toHaveBeenCalled();
//   });
// });