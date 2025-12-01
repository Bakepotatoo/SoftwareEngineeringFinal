import { jest } from "@jest/globals";
import { handleRegister } from "../public/js/registerFunctionality.js";

describe("handleRegister", () => {
  it("calls auth, Firestore, alert, and redirect on success", async () => {
    const mockCreateUser = jest.fn().mockResolvedValue({
      user: { uid: "USER123" },
    });
    const mockAddUser = jest.fn().mockResolvedValue();
    const mockAlert = jest.fn();
    const mockRedirect = jest.fn();

    await handleRegister(
      {
        email: "test@example.com",
        password: "password123",
        username: "juliet",
        confirmPassword: "password123",
      },
      {
        auth: { mock: "auth" },
        createUserWithEmailAndPassword: mockCreateUser,
        addUserToFirestore: mockAddUser,
        alertFn: mockAlert,
        redirectFn: mockRedirect,
      }
    );

    expect(mockCreateUser).toHaveBeenCalledWith(
      { mock: "auth" },
      "test@example.com",
      "password123"
    );
    expect(mockAddUser).toHaveBeenCalledWith(
      "USER123",
      "juliet",
      "test@example.com"
    );
    expect(mockAlert).toHaveBeenCalledWith("Your account has been created!");
    expect(mockRedirect).toHaveBeenCalledWith("launcherone_profile.html");
  });

  it("alerts and stops when passwords do not match", async () => {
    const mockCreateUser = jest.fn();
    const mockAddUser = jest.fn();
    const mockAlert = jest.fn();
    const mockRedirect = jest.fn();

    await handleRegister(
      {
        email: "test@example.com",
        password: "password123",
        username: "juliet",
        confirmPassword: "different",
      },
      {
        auth: {},
        createUserWithEmailAndPassword: mockCreateUser,
        addUserToFirestore: mockAddUser,
        alertFn: mockAlert,
        redirectFn: mockRedirect,
      }
    );

    expect(mockAlert).toHaveBeenCalledWith(
      "Passwords do not match. Please enter the same passwords in both fields."
    );
    expect(mockCreateUser).not.toHaveBeenCalled();
    expect(mockAddUser).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});

/*
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
}); */