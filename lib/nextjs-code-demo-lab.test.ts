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
  "page-tsx-route",
  "layout-tsx-wrapper",
  "route-handler-get-response",
  "environment-variable-safety",
];

describe("Next.js Code Demo Lab lessons", () => {
  it("returns all lessons", () => {
    const lessons = getAllCodeDemoLessons();

    expect(lessons).toHaveLength(9);
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
      expect(lesson.correctCode).toBeTruthy();
      expect(lesson.brokenCode ?? lesson.withoutCode).toBeTruthy();
      expect(lesson.correctOutput).toBeTruthy();
      expect(lesson.brokenOutput ?? lesson.simulatedError).toBeTruthy();
      expect(lesson.explanation).toBeTruthy();
      expect(lesson.commonMistake).toBeTruthy();
      expect(lesson.changeExplanation).toBeTruthy();
      expect(lesson.whyItWorks).toBeTruthy();
      expect(lesson.whyItBreaks).toBeTruthy();
      expect(lesson.mentalModel).toBeTruthy();
      expect(lesson.previewType).toBeTruthy();
    }
  });

  it("every lesson has correctCode or code", () => {
    for (const lesson of getAllCodeDemoLessons()) {
      expect((lesson.correctCode || lesson.code).trim().length).toBeGreaterThan(
        0,
      );
    }
  });

  it("every lesson has withoutCode or brokenCode", () => {
    for (const lesson of getAllCodeDemoLessons()) {
      const comparisonCode = lesson.withoutCode ?? lesson.brokenCode ?? "";

      expect(comparisonCode.trim().length).toBeGreaterThan(0);
    }
  });

  it("every lesson has comparison explanations", () => {
    for (const lesson of getAllCodeDemoLessons()) {
      expect(lesson.whyItWorks.trim().length).toBeGreaterThan(0);
      expect(lesson.whyItBreaks.trim().length).toBeGreaterThan(0);
      expect(lesson.mentalModel.trim().length).toBeGreaterThan(0);
    }
  });

  it("every lesson has correct output", () => {
    for (const lesson of getAllCodeDemoLessons()) {
      expect(lesson.correctOutput.trim().length).toBeGreaterThan(0);
    }
  });

  it("every lesson has broken output or simulated error", () => {
    for (const lesson of getAllCodeDemoLessons()) {
      const brokenResult = lesson.brokenOutput || lesson.simulatedError || "";

      expect(brokenResult.trim().length).toBeGreaterThan(0);
    }
  });

  it("every live lesson has a livePreviewId", () => {
    for (const lesson of getAllCodeDemoLessons()) {
      if (lesson.previewType === "live") {
        expect(lesson.livePreviewId).toBeTruthy();
      }
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
      const lessonCode = [
        lesson.code,
        lesson.correctCode,
        lesson.brokenCode,
        lesson.withoutCode,
      ]
        .filter(Boolean)
        .join("\n");

      expect(lessonCode).not.toMatch(/\beval\s*\(/);
      expect(lessonCode).not.toMatch(/\bnew\s+Function\s*\(/);
      expect(lessonCode).not.toMatch(/\bFunction\s*\(/);
    }
  });
});
