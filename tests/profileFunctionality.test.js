/**
 * Unit tests for profileFunctionality.js
 * 
 * These tests verify:
 * 1. The routing logic after a user submits or loads a profile.
 * 2. The input validation logic for profile fields.
 * 
 * Ensures correctness, prevents regression, and guarantees
 * predictable behavior when teammates integrate this module.
 */

import {
  decidePostProfileRoute,
  validateProfileInputs,
} from "../public/js/profileFunctionality.js";

/**
 * Test: decidePostProfileRoute()
 *
 * This function determines which page the user should be sent to
 * depending on whether their profile is completed or not.
 */
test("profileCompleted true goes to matches", () => {
  // Case 1: Profile is completed → user goes to matches page
  let route = decidePostProfileRoute({ profileCompleted: true });
  expect(route).toBe("launcherone_matches.html");

  // Case 2: Profile exists but is not completed → stay on profile page
  route = decidePostProfileRoute({ profileCompleted: false });
  expect(route).toBe("launcherone_profile.html");

  // Case 3: No profile document at all → default to profile page
  route = decidePostProfileRoute(null);
  expect(route).toBe("launcherone_profile.html");
});

/**
 * Test: validateProfileInputs()
 *
 * This function checks that required profile fields are filled
 * and verifies that budget values are logically correct.
 */
test("validate profile inputs from user", () => {
  // Valid profile object (all fields filled + valid budget range)
  let result = validateProfileInputs({
    name: "Jane Doe",
    bio: "2nd year TRU student, looking for a roommate.",
    age: 21,
    universityYear: "2nd Year",
    gender: "Female",
    roommatePreference: "Female",
    location: "Lower Sahali",
    petFriendly: "Any",
    accommodationType: "2-Bedroom",
    studentStatus: "Undergraduate",
    minBudget: 500,
    maxBudget: 900,
  });

  // Expect no validation errors
  expect(result.isValid).toBe(true);
  expect(result.errors.length).toBe(0);
});
