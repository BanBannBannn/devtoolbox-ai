import { describe, expect, it } from "vitest";
import {
  getCommentErrorMessage,
  mapVisibleCommentsForPublic,
  validateCommentContent,
} from "./comments";

const baseComment = {
  id: "comment-1",
  user_id: "user-1",
  content: "Helpful note",
  status: "visible",
  parent_id: null,
  created_at: "2026-05-29T00:00:00.000Z",
  updated_at: "2026-05-29T00:00:00.000Z",
};

describe("blog comment helpers", () => {
  it("validates comment content length", () => {
    expect(validateCommentContent(" Nice comment ")).toEqual({
      success: true,
      content: "Nice comment",
    });
    expect(validateCommentContent("")).toMatchObject({
      success: false,
    });
    expect(validateCommentContent("a".repeat(2001))).toMatchObject({
      success: false,
    });
  });

  it("maps only visible top-level comments for public display", () => {
    const authorNamesById = new Map([["user-1", "Ada"]]);

    expect(
      mapVisibleCommentsForPublic({
        comments: [
          baseComment,
          { ...baseComment, id: "comment-2", status: "hidden" },
          { ...baseComment, id: "comment-3", status: "removed" },
          { ...baseComment, id: "comment-4", parent_id: "comment-1" },
        ],
        authorNamesById,
        currentUserId: null,
      }),
    ).toEqual([
      {
        id: "comment-1",
        content: "Helpful note",
        authorDisplayName: "Ada",
        createdAt: "2026-05-29T00:00:00.000Z",
        updatedAt: "2026-05-29T00:00:00.000Z",
        isEdited: false,
        canManage: false,
      },
    ]);
  });

  it("marks current user's comments as manageable without exposing user id", () => {
    const [comment] = mapVisibleCommentsForPublic({
      comments: [baseComment],
      authorNamesById: new Map(),
      currentUserId: "user-1",
    });

    expect(comment.canManage).toBe(true);
    expect(comment.authorDisplayName).toBe("DevToolBox AI reader");
    expect(comment).not.toHaveProperty("user_id");
    expect(comment).not.toHaveProperty("email");
  });

  it("detects edited comments", () => {
    const [comment] = mapVisibleCommentsForPublic({
      comments: [
        {
          ...baseComment,
          updated_at: "2026-05-29T00:00:02.000Z",
        },
      ],
      authorNamesById: new Map(),
      currentUserId: null,
    });

    expect(comment.isEdited).toBe(true);
  });

  it("maps safe comment errors", () => {
    expect(getCommentErrorMessage("invalid_comment")).toBe(
      "Comment must be between 1 and 2000 characters.",
    );
    expect(getCommentErrorMessage("forbidden")).toBe(
      "You can only edit or delete your own visible comments.",
    );
    expect(getCommentErrorMessage("unknown")).toBeUndefined();
  });
});
