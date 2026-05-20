import { describe, expect, it } from "vitest";

import { generateNextjsFileTree } from "./nextjs-file-tree-visualizer";

describe("generateNextjsFileTree", () => {
  it("generates a root page route", () => {
    const result = generateNextjsFileTree({
      routePath: "/",
      routeType: "page",
    });

    expect(result.normalizedRoute).toBe("/");
    expect(result.fileTree).toContain("app/page.tsx");
    expect(result.explanation).toContain(
      "app/page.tsx renders the UI for the / route.",
    );
    expect(result.preview).toContain("Page preview");
  });

  it("generates a nested page route", () => {
    const result = generateNextjsFileTree({
      routePath: "/dashboard/settings",
      routeType: "page",
    });

    expect(result.normalizedRoute).toBe("/dashboard/settings");
    expect(result.fileTree).toContain("app/dashboard/settings/page.tsx");
    expect(result.explanation.join(" ")).toContain(
      "dashboard and settings",
    );
    expect(result.preview).toContain("/dashboard/settings");
  });

  it("generates a dynamic route", () => {
    const result = generateNextjsFileTree({
      routePath: "/blog/[slug]",
      routeType: "page",
    });

    expect(result.normalizedRoute).toBe("/blog/[slug]");
    expect(result.fileTree).toContain("app/blog/[slug]/page.tsx");
    expect(result.explanation.join(" ")).toContain(
      "[slug] is a dynamic route segment",
    );
  });

  it("generates an API route handler", () => {
    const result = generateNextjsFileTree({
      routePath: "/api/health",
      routeType: "route-handler",
    });

    expect(result.normalizedRoute).toBe("/api/health");
    expect(result.fileTree).toContain("app/api/health/route.ts");
    expect(result.explanation.join(" ")).toContain(
      "route.ts handles HTTP requests",
    );
    expect(result.preview).toContain('{ "ok": true }');
  });

  it("generates a layout route", () => {
    const result = generateNextjsFileTree({
      routePath: "/dashboard",
      routeType: "layout",
    });

    expect(result.fileTree).toContain("app/dashboard/layout.tsx");
    expect(result.explanation.join(" ")).toContain(
      "layout.tsx wraps child routes",
    );
  });

  it("generates a loading route", () => {
    const result = generateNextjsFileTree({
      routePath: "/blog",
      routeType: "loading",
    });

    expect(result.fileTree).toContain("app/blog/loading.tsx");
    expect(result.explanation.join(" ")).toContain(
      "loading.tsx displays while route content is loading",
    );
    expect(result.preview).toContain("Loading UI");
  });

  it("generates an error route", () => {
    const result = generateNextjsFileTree({
      routePath: "/dashboard/settings",
      routeType: "error",
    });

    expect(result.fileTree).toContain("app/dashboard/settings/error.tsx");
    expect(result.explanation.join(" ")).toContain(
      "error.tsx handles rendering errors",
    );
    expect(result.preview).toContain("Error UI");
  });

  it("normalizes a trailing slash", () => {
    const result = generateNextjsFileTree({
      routePath: "/dashboard/settings/",
      routeType: "page",
    });

    expect(result.normalizedRoute).toBe("/dashboard/settings");
    expect(result.fileTree).toContain("app/dashboard/settings/page.tsx");
  });

  it("rejects an invalid path", () => {
    expect(() =>
      generateNextjsFileTree({
        routePath: "dashboard",
        routeType: "page",
      }),
    ).toThrow("Route path must start with /");
  });
});
