import { normalizeUserPreferences, calculateCompatibilityScore, findBestMatches } from "../public/js/matchesFunctionality.js";

test("roommate preference: similar prefs yield higher score than opposite prefs", () => {
	const userA = { roommatePreference: { cleanliness: "high", smoker: false } };
	const userSimilar = { roommatePreference: { cleanliness: "high", smoker: false } };
	const userOpposite = { roommatePreference: { cleanliness: "low", smoker: true } };

	const scoreSimilar = calculateCompatibilityScore(userA, userSimilar);
	const scoreOpposite = calculateCompatibilityScore(userA, userOpposite);

	expect(scoreSimilar).toBeGreaterThan(scoreOpposite);
});

test("location preference matching: overlapping locations are compatible", () => {
	const userA = { preferredLocation: "Downtown" };
	const userB = { location: "Downtown" };
	const userC = { location: "Suburb" };

	const scoreB = calculateCompatibilityScore(userA, userB);
	const scoreC = calculateCompatibilityScore(userA, userC);

	expect(scoreB).toBeGreaterThan(scoreC);
	expect(scoreB).toBeGreaterThan(0);
});

test("findBestMatches returns sorted results by score", () => {
	const currentUser = { id: "u1", roommatePreference: { cleanliness: "high" }, preferredLocation: "City" };
	const candidates = [
		{ id: "u2", roommatePreference: { cleanliness: "high" }, location: "City" }, // best
		{ id: "u3", roommatePreference: { cleanliness: "low" }, location: "City" },
		{ id: "u4", roommatePreference: { cleanliness: "low" }, location: "Far" },
	];

	const results = findBestMatches(currentUser, candidates);
	expect(results.length).toBe(3);
	expect(results[0].user.id).toBe("u2");
	expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
	expect(results[1].score).toBeGreaterThanOrEqual(results[2].score);
});

test("edge cases: empty list and missing preferences handled", () => {
	const currentUser = { id: "u1" };
	expect(findBestMatches(currentUser, [])).toEqual([]);

	const a = { id: "u1" };
	const b = { id: "u2" };
	expect(() => calculateCompatibilityScore(a, b)).not.toThrow();
	expect(calculateCompatibilityScore(a, b)).toBeGreaterThanOrEqual(0);
});

