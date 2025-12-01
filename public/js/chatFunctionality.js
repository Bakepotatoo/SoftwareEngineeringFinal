// ---------- CHAT ID LOGIC ----------

/**
 * Deterministically build the chat ID for two users.
 *
 * Ensures both users derive the same chatId.
 * Used in domChat.js to store and fetch message threads between two users.
 *
 * @param {string} uid1
 * @param {string} uid2
 * @returns {string}
 */
export function getChatIdForUsers(uid1, uid2) {
  const a = uid1 != null ? String(uid1) : "";
  const b = uid2 != null ? String(uid2) : "";

  // Throws to enforce valid arguments — tested in Jest
  if (!a || !b) {
    throw new Error("Both uid1 and uid2 are required to build a chatId.");
  }

  // Sorting ensures consistency: order of users does not matter
  return a < b ? `${a}_${b}` : `${b}_${a}`;
}

// ---------- MATCH SELECTION LOGIC ----------

/**
 * Select the first valid matched user from a list of Firestore query results.
 * This represents simple matching logic used before starting a chat.
 *
 * Filtering rules:
 *  - Skip null objects
 *  - Skip users without uid field
 *  - Skip currentUser themselves
 * @param {string} currentUid
 * @param {Array<{ uid: string }>} candidates
 * @returns {object|null}
 */
export function pickMatchedUser(currentUid, candidates) {
  if (!currentUid || !Array.isArray(candidates)) return null;

  for (const candidate of candidates) {
    if (!candidate) continue; // ignore null/undefined entries
    if (!candidate.uid) continue; // ignore invalid user objects
    if (candidate.uid === currentUid) continue; // avoid matching with self

    return candidate; // Return first valid match
  }

  return null; // No match found
}

/**
 * Builds a readable display name for matched user UI.
 *
 * This ensures a name always appears in chat UI.
 *
 * @param {object} user
 * @returns {string}
 */
export function buildMatchName(user) {
  if (!user) return "Match";

  const { displayName, firstName, lastName } = user;

  // Most preferred UI option
  if (displayName && displayName.trim()) {
    return displayName.trim();
  }

  // Construct readable full name if possible
  const fullName = `${firstName || ""} ${lastName || ""}`.trim();
  if (fullName) return fullName;

  // Last resort
  return "Match";
}

// ---------- MESSAGE VIEW MODEL LOGIC ----------

/**
 * Formats message content for DOM UI — without touching DOM.
 * Determines if the message is from current user.
 * Used to set alignment + prefix "You:" label.
 *
 * @param {{ senderId: string, text: string }} msg
 * @param {string} currentUid
 * @returns {{ isMe: boolean, text: string }}
 */
export function buildMessageViewModel(msg, currentUid) {
  const safeMsg = msg || {};
  const isMe = safeMsg.senderId === currentUid;
  const text = (isMe ? "You: " : "") + (safeMsg.text || "");

  return { isMe, text };
}

// ---------- SEND-MESSAGE LOGIC ----------

/**
 * Validation logic used before sending a message to Firestore.
 * Ensures:
 *  - Both users exist and have uid
 *  - Chat session exists
 *  - Text content is not blank
 *
 * This prevents calling Firestore APIs with invalid data.
 *
 * @param {{ uid: string } | null} currentUser
 * @param {{ uid: string } | null} matchedUser
 * @param {string | null} chatId
 * @param {string} text
 * @returns {boolean}
 */
export function canSendMessage(currentUser, matchedUser, chatId, text) {
  if (!currentUser || !currentUser.uid) return false;
  if (!matchedUser || !matchedUser.uid) return false;
  if (!chatId) return false;

  const trimmed = (text || "").trim();
  if (!trimmed) return false;

  return true;
}

/**
 * Creates the final message object that will be sent to Firestore.
 * Wrapped in a function → makes it easy to test without real Firestore.
 *
 * Timestamp is injected via callback (serverTimestamp inside DOM code).
 *
 * Throwing here improves reliability — Fail Fast principle.
 *
 * @param {{ uid: string }} currentUser
 * @param {{ uid: string }} matchedUser
 * @param {string} chatId
 * @param {string} text
 * @param {() => any} timestampFn
 * @returns {object}
 */
export function createMessagePayload(
  currentUser,
  matchedUser,
  chatId,
  text,
  timestampFn
) {
  // Ensure message is valid before creating object
  if (!canSendMessage(currentUser, matchedUser, chatId, text)) {
    throw new Error(
      "Cannot create payload: invalid user, match, chatId, or text."
    );
  }

  const trimmed = text.trim();
  const createdAt =
    typeof timestampFn === "function"
      ? timestampFn() // Firestore server timestamp
      : timestampFn; // Accept static timestamp in Jest tests

  // Data format consistent with Firestore "messages" collection structure
  return {
    chatId,
    senderId: currentUser.uid,
    receiverId: matchedUser.uid,
    text: trimmed,
    createdAt,
  };
}
