/**
 * profileFunctionality.js
 *
 * Contains pure logic functions for:
 * 1. Deciding the correct post-profile route.
 * 2. Validating profile input fields before saving.
 *
 * These functions do NOT interact with DOM or Firebase directly,
 * making them fully testable and reusable across the application.
 */

/**
 * Determines which page the user should navigate to
 * after profile data is loaded or saved.
 *
 * @param {Object|null} profileDocData - Firestore document data for the user.
 * @returns {string} - The HTML page the user should navigate to.
 *
 * Rules:
 * - If profileCompleted === true → matches page.
 * - Otherwise → stay on profile page.
 * - If no data at all → treat as incomplete.
 */
export function decidePostProfileRoute(profileDocData) {
  if (!profileDocData) return "launcherone_profile.html";

  if (profileDocData.profileCompleted === true) {
    return "launcherone_matches.html";
  }

  return "launcherone_profile.html";
}

/**
 * Validates all profile input fields before saving
 * to ensure the information is complete and meaningful.
 *
 * @param {Object} profile - Raw profile form values.
 * @returns {Object} - { isValid: boolean, errors: string[] }
 *
 * The `errors` array contains field names that fail validation.
 */
export function validateProfileInputs(profile) {
  const errors = [];

  // Required text fields
  if (!profile.name) errors.push("name");
  if (!profile.bio) errors.push("bio");
  if (!profile.age) errors.push("age");
  if (!profile.universityYear) errors.push("universityYear");
  if (!profile.gender) errors.push("gender");
  if (!profile.roommatePreference) errors.push("roommatePreference");
  if (!profile.location) errors.push("location");
  if (!profile.petFriendly) errors.push("petFriendly");
  if (!profile.accommodationType) errors.push("accommodationType");
  if (!profile.studentStatus) errors.push("studentStatus");

  // Budget fields (allow numeric strings but must not be empty)
  if (
    profile.minBudget === "" ||
    profile.minBudget === undefined ||
    profile.minBudget === null
  ) {
    errors.push("minBudget");
  }

  if (
    profile.maxBudget === "" ||
    profile.maxBudget === undefined ||
    profile.maxBudget === null
  ) {
    errors.push("maxBudget");
  }

  // Budget logic: minBudget should not exceed maxBudget
  const min = Number(profile.minBudget);
  const max = Number(profile.maxBudget);

  if (!Number.isNaN(min) && !Number.isNaN(max) && min > max) {
    errors.push("budgetRange");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

