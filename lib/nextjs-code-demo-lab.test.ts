import { describe, expect, it } from "vitest";

import {
  getAllCodeDemoLessons,
  getCodeDemoLessonById,
  getDefaultCodeDemoLesson,
} from "./nextjs-code-demo-lab";

const expectedLessonIds = [
  "use-state-counter",
  "props-example",
  "conditional-rendering",
  "list-rendering",
  "client-vs-server-component",
  "route-handler-get-response",
  "environment-variable-safety",
];

describe("Next.js Code Demo Lab lessons", () => {
  it("returns all lessons", () => {
    const lessons = getAllCodeDemoLessons();

    expect(lessons).toHaveLength(7);
    expect(lessons.map((lesson) => lesson.id)).toEqual(expectedLessonIds);
  });

  it("returns the default lesson", () => {
    const defaultLesson = getDefaultCodeDemoLesson();

    expect(defaultLesson.id).toBe("use-state-counter");
    expect(defaultLesson.title).toBe("useState Counter");
  });

  it("finds a lesson by id", () => {
    const lesson = getCodeDemoLessonById("props-example");

    expect(lesson?.title).toBe("Props Example");
    expect(lesson?.concept.toLowerCase()).toContain("props");
  });

  it("returns undefined for an invalid id", () => {
    expect(getCodeDemoLessonById("missing-lesson")).toBeUndefined();
  });

  it("every lesson has required fields", () => {
    for (const lesson of getAllCodeDemoLessons()) {
      expect(lesson.id).toBeTruthy();
      expect(lesson.title).toBeTruthy();
      expect(lesson.difficulty).toBeTruthy();
      expect(lesson.concept).toBeTruthy();
      expect(lesson.code).toBeTruthy();
      expect(lesson.explanation).toBeTruthy();
      expect(lesson.commonMistake).toBeTruthy();
      expect(lesson.changeExplanation).toBeTruthy();
      expect(lesson.previewType).toBeTruthy();
    }
  });

  it("every lesson has non-empty code", () => {
    for (const lesson of getAllCodeDemoLessons()) {
      expect(lesson.code.trim().length).toBeGreaterThan(0);
    }
  });

  it("every lesson previewType is either live or simulated", () => {
    for (const lesson of getAllCodeDemoLessons()) {
      expect(["live", "simulated"]).toContain(lesson.previewType);
    }
  });

  it("lessons do not include eval or Function constructor", () => {
    for (const lesson of getAllCodeDemoLessons()) {
      expect(lesson.code).not.toMatch(/\beval\s*\(/);
      expect(lesson.code).not.toMatch(/\bnew\s+Function\s*\(/);
      expect(lesson.code).not.toMatch(/\bFunction\s*\(/);
    }
  });
});
