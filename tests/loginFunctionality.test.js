import { validateLoginInputs } from "../public/js/loginFunctionality.js";
import { decidePostLoginRoute } from "../public/js/loginFunctionality.js";

test("profileCompleted true goes to matches", () => {
  // Case 1: for when the profileCompleted is true
  let route = decidePostLoginRoute({ profileCompleted: true });
  expect(route).toBe("launcherone_matches.html");

  //Case 2: for if profileCompleted is false
  route = decidePostLoginRoute({ profileCompleted: 0 });
  expect(route).toBe("launcherone_profile.html");
});

test("validate login inputs from user", () => {
  // Case 1: both email & password provided
  let result = validateLoginInputs("test@example.com", "123456");
  expect(result.isValid).toBe(true);
  expect(result.errors.length).toBe(0);

  // Case 2: email missing
  result = validateLoginInputs("", "123456");
  expect(result.isValid).toBe(false);
  expect(result.errors).toContain("email");

  // Case 3: password missing
  result = validateLoginInputs("test@example.com", "");
  expect(result.isValid).toBe(false);
  expect(result.errors).toContain("password");

  // Case 4: both missing
  result = validateLoginInputs("", "");
  expect(result.isValid).toBe(false);
  expect(result.errors).toContain("email");
  expect(result.errors).toContain("password");
});
