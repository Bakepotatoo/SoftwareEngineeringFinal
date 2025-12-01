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
