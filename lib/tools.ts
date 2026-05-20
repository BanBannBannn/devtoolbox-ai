export type ToolCategory = "Formatters" | "Generators" | "Git" | "Testing";

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
      Git: [],
      Testing: [],
    },
  );
}
