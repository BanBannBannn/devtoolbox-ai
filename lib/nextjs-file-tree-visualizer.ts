export type NextjsRouteType =
  | "page"
  | "layout"
  | "loading"
  | "error"
  | "route-handler";

export type GenerateNextjsFileTreeInput = {
  routePath: string;
  routeType: NextjsRouteType;
};

export type GenerateNextjsFileTreeResult = {
  normalizedRoute: string;
  fileTree: string;
  explanation: string[];
  preview: string;
};

const fileNameByRouteType: Record<NextjsRouteType, string> = {
  page: "page.tsx",
  layout: "layout.tsx",
  loading: "loading.tsx",
  error: "error.tsx",
  "route-handler": "route.ts",
};

const safeSegmentPattern = /^[A-Za-z0-9._-]+$|^\[[A-Za-z0-9._-]+\]$/;

function normalizeRoutePath(routePath: string) {
  const trimmedPath = routePath.trim();

  if (!trimmedPath) {
    throw new Error("Route path is required.");
  }

  if (!trimmedPath.startsWith("/")) {
    throw new Error("Route path must start with /.");
  }

  const collapsedPath = trimmedPath.replace(/\/+/g, "/");

  if (collapsedPath === "/") {
    return "/";
  }

  return collapsedPath.replace(/\/$/, "");
}

function getRouteSegments(normalizedRoute: string) {
  if (normalizedRoute === "/") {
    return [];
  }

  const segments = normalizedRoute.split("/").filter(Boolean);

  for (const segment of segments) {
    if (!safeSegmentPattern.test(segment)) {
      throw new Error(
        "Route path contains unsupported characters. Use letters, numbers, dashes, underscores, dots, slashes, or dynamic segments like [slug].",
      );
    }
  }

  return segments;
}

function buildFilePath(segments: string[], routeType: NextjsRouteType) {
  return ["app", ...segments, fileNameByRouteType[routeType]].join("/");
}

function buildFileTree(filePath: string) {
  return filePath;
}

function humanizeSegments(segments: string[]) {
  if (segments.length === 0) {
    return "the root route";
  }

  if (segments.length === 1) {
    return segments[0];
  }

  return `${segments.slice(0, -1).join(", ")} and ${segments.at(-1)}`;
}

function getRouteTypeExplanation(
  filePath: string,
  normalizedRoute: string,
  routeType: NextjsRouteType,
) {
  switch (routeType) {
    case "page":
      return `${filePath} renders the UI for the ${normalizedRoute} route.`;
    case "layout":
      return `${filePath} uses layout.tsx. layout.tsx wraps child routes in this segment.`;
    case "loading":
      return `${filePath} uses loading.tsx. loading.tsx displays while route content is loading.`;
    case "error":
      return `${filePath} uses error.tsx. error.tsx handles rendering errors for this segment.`;
    case "route-handler":
      return `${filePath} uses route.ts. route.ts handles HTTP requests for this route.`;
  }
}

function buildExplanation(
  filePath: string,
  normalizedRoute: string,
  segments: string[],
  routeType: NextjsRouteType,
) {
  const explanation = [
    `${normalizedRoute} maps to ${filePath} in the Next.js app directory.`,
    `The route segments are ${humanizeSegments(segments)}.`,
    getRouteTypeExplanation(filePath, normalizedRoute, routeType),
    "This tool is educational only and does not execute code or create files.",
  ];

  const dynamicSegments = segments.filter(
    (segment) => segment.startsWith("[") && segment.endsWith("]"),
  );

  if (dynamicSegments.length > 0) {
    explanation.splice(
      2,
      0,
      `${dynamicSegments.join(", ")} is a dynamic route segment that matches a value from the URL.`,
    );
  }

  return explanation;
}

function buildPreview(normalizedRoute: string, routeType: NextjsRouteType) {
  switch (routeType) {
    case "page":
      return `Page preview: a visitor to ${normalizedRoute} would see the React UI exported from page.tsx.`;
    case "layout":
      return `Layout preview: child routes under ${normalizedRoute} would render inside the layout.tsx shell.`;
    case "loading":
      return `Loading UI: users may see loading.tsx while ${normalizedRoute} is preparing route content.`;
    case "error":
      return `Error UI: users may see error.tsx if rendering fails inside ${normalizedRoute}.`;
    case "route-handler":
      return `API route response preview: { "ok": true }`;
  }
}

export function generateNextjsFileTree({
  routePath,
  routeType,
}: GenerateNextjsFileTreeInput): GenerateNextjsFileTreeResult {
  const normalizedRoute = normalizeRoutePath(routePath);
  const segments = getRouteSegments(normalizedRoute);
  const filePath = buildFilePath(segments, routeType);

  return {
    normalizedRoute,
    fileTree: buildFileTree(filePath),
    explanation: buildExplanation(
      filePath,
      normalizedRoute,
      segments,
      routeType,
    ),
    preview: buildPreview(normalizedRoute, routeType),
  };
}
