export type GenerateAiCodingPromptInput = {
  taskType: string;
  techStack: string;
  featureDescription: string;
  constraints: string;
  expectedOutput: string;
};

const defaultTaskType = "Implement the requested coding task";
const defaultTechStack = "Use the existing project tech stack.";
const defaultFeatureDescription =
  "Use the provided project context to complete the requested work.";
const defaultConstraints =
  "Keep the solution simple and scoped. Do not add extra features. Follow existing project patterns.";
const defaultOutputFormat =
  "Return changed files, test results, and a brief explanation of important decisions.";

export function generateAiCodingPrompt(
  input: GenerateAiCodingPromptInput,
): string {
  const taskType = input.taskType.trim() || defaultTaskType;
  const techStack = input.techStack.trim() || defaultTechStack;
  const featureDescription =
    input.featureDescription.trim() || defaultFeatureDescription;
  const constraints = input.constraints.trim() || defaultConstraints;
  const expectedOutput = input.expectedOutput.trim() || defaultOutputFormat;

  return [
    "## Role",
    "You are a senior software engineer helping implement a focused coding task.",
    "",
    "## Context",
    `Tech stack: ${techStack}`,
    `Feature or task context: ${featureDescription}`,
    "",
    "## Task",
    taskType,
    "",
    "## Requirements",
    "- Read the relevant project documentation before coding.",
    "- Implement only the requested task.",
    "- Keep the solution clean, typed, and easy to maintain.",
    "- Add or update tests for pure logic when applicable.",
    "",
    "## Constraints",
    constraints,
    "",
    "## Output format",
    expectedOutput,
    "",
    "## Things not to do",
    "- Do not add extra features.",
    "- Do not introduce unrelated refactors.",
    "- Do not add backend services, databases, auth, payments, analytics, or external AI API calls unless explicitly requested.",
    "- Do not silently ignore errors or invalid input.",
    "",
  ].join("\n");
}
