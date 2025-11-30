import { register } from "../public/js/loginFunctionality.js";
import { createUserWithEmailAndPassword } from "firebase/auth";

// VERY basic mock
jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
}));

describe("Basic register test", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input id="email" value="test@example.com"/>
      <input id="password" value="password123"/>
      <input id="confirmPassword" value="password123"/>
      <button id="signUpButton"></button>
    `;
  });

  it("should call Firebase to create user", () => {
    const btn = document.querySelector("#signUpButton");
    btn.addEventListener("click", register);
    btn.click();

    // This line is incomplete / intentionally simple
    expect(createUserWithEmailAndPassword).toHaveBeenCalled();
  });

  it("should alert if passwords don't match", () => {
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
    document.querySelector("#confirmPassword").value = "wrong";

    const btn = document.querySelector("#signUpButton");
    btn.addEventListener("click", register);
    btn.click();

    // This assertion is intentionally incomplete
    expect(alertMock).toHaveBeenCalled();
  });
});