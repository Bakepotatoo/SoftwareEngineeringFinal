
// function to decide where to send the user after login
export function decidePostLoginRoute(userDocData) {
  if (!userDocData) return "launcherone_profile.html";

  if (userDocData.profileCompleted === true) {
    return "launcherone_matches.html";
  }
  return "launcherone_profile.html";
}

// function to validate login inputs from users
export function validateLoginInputs(email, password) {
  const errors = [];
  if (!email) errors.push("email");
  if (!password) errors.push("password");
  return {
    isValid: errors.length === 0,
    errors,
  };
}
