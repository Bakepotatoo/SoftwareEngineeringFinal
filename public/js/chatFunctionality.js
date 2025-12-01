// chatFunctionality.js
// Pure logic extracted from domchat.js for unit testing with Jest.
// No DOM, no Firebase imports.

// ---------- CHAT ID LOGIC ----------

/**
 * Deterministically build the chat ID for two users.
 * Mirrors:
 *   uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`
 *
 * Ensures both users derive the same chatId.
 *
 * @param {string} uid1
 * @param {string} uid2
 * @returns {string}
 */
export function getChatIdForUsers(uid1, uid2) {
  const a = uid1 != null ? String(uid1) : "";
  const b = uid2 != null ? String(uid2) : "";

  if (!a || !b) {
    throw new Error("Both uid1 and uid2 are required to build a chatId.");
  }

  return a < b ? `${a}_${b}` : `${b}_${a}`;
}

// ---------- MATCH SELECTION LOGIC ----------

/**
 * Given the current user's UID and a list of candidate user objects,
 * pick the first user that:
 *   - is not the current user, and
 *   - has a uid property.
 *
 * This mirrors your Firestore query iteration:
 *   - you loop through docs and pick the first where doc.id !== currentUser.uid
 *
 * @param {string} currentUid
 * @param {Array<{ uid: string }>} candidates
 * @returns {object|null}
 */
export function pickMatchedUser(currentUid, candidates) {
  if (!currentUid || !Array.isArray(candidates)) return null;

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (!candidate.uid) continue;
    if (candidate.uid === currentUid) continue;

    return candidate;
  }

  return null;
}

/**
 * Build the display name for the matched user.
 * Mirrors:
 *   displayName ||
 *   `${firstName || ""} ${lastName || ""}`.trim() ||
 *   "Match"
 *
 * @param {object} user
 * @returns {string}
 */
export function buildMatchName(user) {
  if (!user) return "Match";

  const {
    displayName,
    firstName,
    lastName
  } = user;

  if (displayName && displayName.trim()) {
    return displayName.trim();
  }

  const fullName = `${firstName || ""} ${lastName || ""}`.trim();
  if (fullName) return fullName;

  return "Match";
}

// ---------- MESSAGE VIEW MODEL LOGIC ----------

/**
 * Given a message object from Firestore and the current user's UID,
 * decide if it's "me" and build the text that should be displayed.
 *
 * Mirrors your renderMessage() logic:
 *   const isMe = msg.senderId === currentUser.uid;
 *   innerDiv.textContent = (isMe ? "You: " : "") + msg.text;
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
 * Determine if we are allowed to send a message.
 * Mirrors the checks in sendMessage():
 *   - currentUser, matchedUser, and chatId must exist
 *   - text must be non-empty after trim()
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
 * Build the Firestore message payload you pass to addDoc().
 * Mirrors:
 *   {
 *     chatId,
 *     senderId: currentUser.uid,
 *     receiverId: matchedUser.uid,
 *     text,
 *     createdAt: serverTimestamp()
 *   }
 *
 * We accept a timestamp factory function so tests don't depend on Firestore.
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
  if (!canSendMessage(currentUser, matchedUser, chatId, text)) {
    throw new Error("Cannot create payload: invalid user, match, chatId, or text.");
  }

  const trimmed = text.trim();
  const createdAt = typeof timestampFn === "function"
    ? timestampFn()
    : timestampFn;

  return {
    chatId,
    senderId: currentUser.uid,
    receiverId: matchedUser.uid,
    text: trimmed,
    createdAt
  };
}
