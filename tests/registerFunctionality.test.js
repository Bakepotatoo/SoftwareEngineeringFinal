// Mock Firebase modules
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  setDoc: jest.fn(),
  doc: jest.fn(),
}));

// Import functions to test
import { register, addUserToFirestore } from "../public/js/loginFunctionality.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc } from "firebase/firestore";

describe("register function", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input id="email" value="test@example.com"/>
      <input id="password" value="password123"/>
      <input id="username" value="testuser"/>
      <input id="confirmPassword" value="password123"/>
      <button id="signUpButton"></button>
    `;
  });

  it("should call createUserWithEmailAndPassword when passwords match", async () => {
    createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: "123" }
    });

    const signUpButton = document.querySelector("#signUpButton");
    signUpButton.addEventListener("click", register);
    signUpButton.click();

    await Promise.resolve();

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.any(Object),
      "test@example.com",
      "password123"
    );
  });

  it("should alert when passwords do not match", async () => {
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
    document.querySelector("#confirmPassword").value = "wrongpass";

    const signUpButton = document.querySelector("#signUpButton");
    signUpButton.addEventListener("click", register);
    signUpButton.click();

    expect(alertMock).toHaveBeenCalledWith(
      "Passwords do not match. Please enter the same passwords in both fields."
    );

    alertMock.mockRestore();
  });
});

describe("addUserToFirestore function", () => {
  it("should call setDoc with correct arguments", async () => {
    const mockSetDoc = setDoc.mockResolvedValue();
    await addUserToFirestore("123", "testuser", "test@example.com");

    expect(setDoc).toHaveBeenCalledWith(
      expect.any(Object),
      {
        username: "testuser",
        email: "test@example.com",
        createdAt: expect.any(Date)
      }
    );
  });
});