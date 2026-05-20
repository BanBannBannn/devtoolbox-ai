export type ToolCategory =
  | "Formatters"
  | "Generators"
  | "Calculators"
  | "Git"
  | "Testing"
  | "Learning";

export type Tool = {
  slug: string;
  title: string;
  description: string;
  category: ToolCategory;
  href: string;
  status: "planned" | "available";
};

export const tools: Tool[] = [
  {
    slug: "json-formatter",
    title: "JSON Formatter",
    description:
      "Validate raw JSON and format it with readable two-space indentation.",
    category: "Formatters",
    href: "/tools/json-formatter",
    status: "available",
  },
  {
    slug: "jwt-decoder",
    title: "JWT Decoder",
    description:
      "Decode JWT header and payload JSON without verifying the signature.",
    category: "Formatters",
    href: "/tools/jwt-decoder",
    status: "available",
  },
  {
    slug: "readme-generator",
    title: "README Generator",
    description:
      "Create a structured Markdown README from simple project details.",
    category: "Generators",
    href: "/tools/readme-generator",
    status: "available",
  },
  {
    slug: "uuid-generator",
    title: "UUID Generator",
    description:
      "Generate one or more UUID v4 strings with lowercase or uppercase output.",
    category: "Generators",
    href: "/tools/uuid-generator",
    status: "available",
  },
  {
    slug: "qr-code-generator",
    title: "QR Code Generator",
    description:
      "Generate downloadable PNG QR codes from text or URLs in the browser.",
    category: "Generators",
    href: "/tools/qr-code-generator",
    status: "available",
  },
  {
    slug: "date-calculator",
    title: "Date Calculator",
    description:
      "Add or subtract days, months, and years, or calculate days between dates.",
    category: "Calculators",
    href: "/tools/date-calculator",
    status: "available",
  },
  {
    slug: "unix-timestamp-converter",
    title: "Unix Timestamp Converter",
    description:
      "Convert Unix timestamps in seconds or milliseconds to readable dates.",
    category: "Calculators",
    href: "/tools/unix-timestamp-converter",
    status: "available",
  },
  {
    slug: "ai-coding-prompt-generator",
    title: "AI Coding Prompt Generator",
    description:
      "Turn feature notes, constraints, and expected output into a clearer coding prompt.",
    category: "Generators",
    href: "/tools/ai-coding-prompt-generator",
    status: "available",
  },
  {
    slug: "git-command-helper",
    title: "Git Command Helper",
    description:
      "Pick a common Git goal and review the command before running it yourself.",
    category: "Git",
    href: "/tools/git-command-helper",
    status: "available",
  },
  {
    slug: "test-case-checklist-generator",
    title: "Test Case Checklist Generator",
    description:
      "Draft a practical manual QA checklist for a feature, platform, and flow.",
    category: "Testing",
    href: "/tools/test-case-checklist-generator",
    status: "available",
  },
  {
    slug: "nextjs-file-tree-visualizer",
    title: "Next.js File Tree Visualizer",
    description:
      "Map App Router paths to app directory files for pages, layouts, loading UI, errors, and route handlers.",
    category: "Learning",
    href: "/tools/nextjs-file-tree-visualizer",
    status: "available",
  },
];

export function getFeaturedTools(limit = 3) {
  return tools.slice(0, limit);
}

export function getToolsByCategory() {
  return tools.reduce<Record<ToolCategory, Tool[]>>(
    (groups, tool) => {
      groups[tool.category].push(tool);
      return groups;
    },
    {
      Formatters: [],
      Generators: [],
      Calculators: [],
      Git: [],
      Testing: [],
      Learning: [],
    },
  );
}
