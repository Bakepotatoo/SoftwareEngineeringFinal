// chatFunctionality.test.js
// Jest tests for chatFunctionality.js (ESM style)

import {
  getChatIdForUsers,
  pickMatchedUser,
  buildMatchName,
  buildMessageViewModel,
  canSendMessage,
  createMessagePayload
} from "../public/js/chatFunctionality.js";

describe("getChatIdForUsers", () => {
  test("returns a deterministic chatId regardless of parameter order", () => {
    const id1 = getChatIdForUsers("user1", "user2");
    const id2 = getChatIdForUsers("user2", "user1");

    expect(id1).toBe("user1_user2");
    expect(id2).toBe("user1_user2");
  });

  test("throws an error if one or both uids are missing or empty", () => {
    expect(() => getChatIdForUsers("user1", null)).toThrow();
    expect(() => getChatIdForUsers("", "user2")).toThrow();
    expect(() => getChatIdForUsers(undefined, "user2")).toThrow();
  });
});

describe("pickMatchedUser", () => {
  test("returns first candidate whose uid is not the current user's uid", () => {
    const currentUid = "uCurrent";
    const result = pickMatchedUser(currentUid, [
      { uid: "uCurrent" },         // should be skipped
      { uid: "uMatch1", name: "One" },
      { uid: "uMatch2", name: "Two" }
    ]);

    expect(result).toEqual({ uid: "uMatch1", name: "One" });
  });

  test("skips candidates without uid and continues searching", () => {
    const currentUid = "me";
    const result = pickMatchedUser(currentUid, [
      { somethingElse: "no-uid" },
      null,
      { uid: "me" },
      { uid: "other", extra: true }
    ]);

    expect(result).toEqual({ uid: "other", extra: true });
  });

  test("returns null when there are no valid matches", () => {
    const currentUid = "u1";
    const result1 = pickMatchedUser(currentUid, [{ uid: "u1" }]);
    const result2 = pickMatchedUser(currentUid, []);
    const result3 = pickMatchedUser(currentUid, null);

    expect(result1).toBeNull();
    expect(result2).toBeNull();
    expect(result3).toBeNull();
  });
});

describe("buildMatchName", () => {
  test("uses displayName when it is present and non-empty", () => {
    const name = buildMatchName({
      uid: "x",
      displayName: "  Roomie Name  ",
      firstName: "Should",
      lastName: "NotUse"
    });

    expect(name).toBe("Roomie Name"); // trimmed
  });

  test("falls back to 'firstName lastName' when displayName is missing", () => {
    const name = buildMatchName({
      uid: "x",
      firstName: "First",
      lastName: "Last"
    });

    expect(name).toBe("First Last");
  });

  test("handles missing firstName or lastName when building full name", () => {
    const onlyFirst = buildMatchName({
      uid: "x",
      firstName: "OnlyFirst"
    });
    const onlyLast = buildMatchName({
      uid: "y",
      lastName: "OnlyLast"
    });

    expect(onlyFirst).toBe("OnlyFirst");
    expect(onlyLast).toBe("OnlyLast");
  });

  test("returns 'Match' if no name fields are usable or user is null", () => {
    const emptyObj = buildMatchName({ uid: "x" });
    const nullUser = buildMatchName(null);

    expect(emptyObj).toBe("Match");
    expect(nullUser).toBe("Match");
  });
});

describe("buildMessageViewModel", () => {
  test("marks message as from 'me' and prefixes 'You: ' when senderId matches currentUid", () => {
    const viewModel = buildMessageViewModel(
      { senderId: "me", text: "Hello!" },
      "me"
    );

    expect(viewModel).toEqual({
      isMe: true,
      text: "You: Hello!"
    });
  });

  test("marks message as from 'other' and does not prefix when senderId differs", () => {
    const viewModel = buildMessageViewModel(
      { senderId: "other", text: "Hi there" },
      "me"
    );

    expect(viewModel).toEqual({
      isMe: false,
      text: "Hi there"
    });
  });

  test("handles missing text field by treating it as empty string", () => {
    const viewModel = buildMessageViewModel(
      { senderId: "other" },
      "me"
    );

    expect(viewModel.isMe).toBe(false);
    expect(viewModel.text).toBe("");
  });

  test("handles null msg object gracefully", () => {
    const viewModel = buildMessageViewModel(null, "me");

    expect(viewModel.isMe).toBe(false);
    expect(viewModel.text).toBe("");
  });
});

describe("canSendMessage", () => {
  test("returns true when currentUser, matchedUser, chatId, and non-empty text are provided", () => {
    const canSend = canSendMessage(
      { uid: "sender" },
      { uid: "receiver" },
      "sender_receiver",
      "Hello there"
    );

    expect(canSend).toBe(true);
  });

  test("returns false when currentUser is missing or has no uid", () => {
    expect(
      canSendMessage(null, { uid: "receiver" }, "id", "hi")
    ).toBe(false);

    expect(
      canSendMessage({}, { uid: "receiver" }, "id", "hi")
    ).toBe(false);
  });

  test("returns false when matchedUser is missing or has no uid", () => {
    expect(
      canSendMessage({ uid: "sender" }, null, "id", "hi")
    ).toBe(false);

    expect(
      canSendMessage({ uid: "sender" }, {}, "id", "hi")
    ).toBe(false);
  });

  test("returns false when chatId is missing", () => {
    expect(
      canSendMessage({ uid: "sender" }, { uid: "receiver" }, null, "hi")
    ).toBe(false);
  });

  test("returns false when text is empty or only whitespace", () => {
    expect(
      canSendMessage(
        { uid: "sender" },
        { uid: "receiver" },
        "id",
        ""
      )
    ).toBe(false);

    expect(
      canSendMessage(
        { uid: "sender" },
        { uid: "receiver" },
        "id",
        "   "
      )
    ).toBe(false);
  });
});

describe("createMessagePayload", () => {
  test("builds a payload matching the expected Firestore structure and trims text", () => {
    const fakeTimestamp = { seconds: 123, nanoseconds: 456 };

    const payload = createMessagePayload(
      { uid: "sender" },
      { uid: "receiver" },
      "sender_receiver",
      "  message text  ",
      () => fakeTimestamp
    );

    expect(payload).toEqual({
      chatId: "sender_receiver",
      senderId: "sender",
      receiverId: "receiver",
      text: "message text", // trimmed
      createdAt: fakeTimestamp
    });
  });

  test("throws if canSendMessage rules are not satisfied", () => {
    // invalid text
    expect(() =>
      createMessagePayload(
        { uid: "sender" },
        { uid: "receiver" },
        "sender_receiver",
        "   ",
        () => ({})
      )
    ).toThrow();

    // invalid currentUser
    expect(() =>
      createMessagePayload(
        null,
        { uid: "receiver" },
        "sender_receiver",
        "ok",
        () => ({})
      )
    ).toThrow();

    // invalid matchedUser
    expect(() =>
      createMessagePayload(
        { uid: "sender" },
        null,
        "sender_receiver",
        "ok",
        () => ({})
      )
    ).toThrow();

    // missing chatId
    expect(() =>
      createMessagePayload(
        { uid: "sender" },
        { uid: "receiver" },
        null,
        "ok",
        () => ({})
      )
    ).toThrow();
  });

  test("accepts a non-function timestamp parameter as-is", () => {
    const staticTimestamp = { static: true };

    const payload = createMessagePayload(
      { uid: "sender" },
      { uid: "receiver" },
      "sender_receiver",
      "hello",
      staticTimestamp
    );

    expect(payload.createdAt).toBe(staticTimestamp);
  });
});
