// Pure matching logic for roommate matching
export function normalizeUserPreferences(user = {}) {
  const rawPref = user.roommatePreference;
  let preferences = {};

  if (!rawPref) {
    preferences = {};
  } else if (typeof rawPref === "string") {
    preferences = { type: rawPref };
  } else if (typeof rawPref === "object") {
    preferences = { ...rawPref };
  }

  const locations = [];
  if (user.preferredLocation) {
    if (Array.isArray(user.preferredLocation)) {
      locations.push(...user.preferredLocation);
    } else if (typeof user.preferredLocation === "string") {
      locations.push(user.preferredLocation);
    }
  } else if (user.location) {
    if (Array.isArray(user.location)) {
      locations.push(...user.location);
    } else if (typeof user.location === "string") {
      locations.push(user.location);
    }
  }

  return { preferences, locations };
}

export function calculateCompatibilityScore(userA = {}, userB = {}) {
  const a = normalizeUserPreferences(userA);
  const b = normalizeUserPreferences(userB);

  // Preference similarity
  const keysA = Object.keys(a.preferences);
  const keysB = Object.keys(b.preferences);
  const allKeys = Array.from(new Set([...keysA, ...keysB]));

  let prefScore = 0;
  if (allKeys.length === 0) {
    prefScore = 0; // no preferences to compare
  } else {
    let matches = 0;
    allKeys.forEach((k) => {
      const va = a.preferences[k];
      const vb = b.preferences[k];
      if (va !== undefined && vb !== undefined && va === vb) matches++;
      // If both are simple 'type' string keys, allow exact match
      if (k === "type" && keysA.length === 1 && keysB.length === 1) {
        // handled above by equality check
      }
    });
    prefScore = matches / allKeys.length;
  }

  // Location score: 1 if any overlap, else 0
  const overlap = a.locations.filter((loc) => b.locations.includes(loc));
  const locationScore = overlap.length > 0 ? 1 : 0;

  // Weighted combination (preferences more important)
  const score = prefScore * 0.7 + locationScore * 0.3;
  return Number(score.toFixed(4));
}

export function findBestMatches(currentUser = {}, allUsers = []) {
  if (!Array.isArray(allUsers) || allUsers.length === 0) return [];

  const currentId = currentUser.id || currentUser.uid || null;

  const scored = allUsers
    .filter((u) => {
      const uid = u.id || u.uid || null;
      if (!uid) return true; // keep users without id (for tests)
      if (currentId && uid === currentId) return false;
      return true;
    })
    .map((u) => ({ user: u, score: calculateCompatibilityScore(currentUser, u) }))
    .sort((a, b) => b.score - a.score);

  return scored;
}
