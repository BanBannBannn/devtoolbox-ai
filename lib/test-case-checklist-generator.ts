export type GenerateTestCaseChecklistInput = {
  featureName: string;
  mainUserFlow: string;
  edgeCases: string;
  platform: string;
};

const fallbackFeatureName = "Untitled Feature";
const fallbackMainUserFlow = "Complete the main user flow successfully.";
const fallbackPlatform = "Target platform";

const genericEdgeCases = [
  "Empty or missing input is handled.",
  "Invalid input shows a helpful message.",
  "Very large or unexpected input does not break the feature.",
];

export function generateTestCaseChecklist(
  input: GenerateTestCaseChecklistInput,
): string {
  const featureName = input.featureName.trim() || fallbackFeatureName;
  const mainUserFlow = input.mainUserFlow.trim() || fallbackMainUserFlow;
  const platform = input.platform.trim() || fallbackPlatform;
  const edgeCaseItems = parseList(input.edgeCases, genericEdgeCases);

  return [
    `# QA Checklist: ${featureName}`,
    "",
    `Platform: ${platform}`,
    "",
    "## Smoke Tests",
    "- [ ] Page or feature loads without crashing.",
    "- [ ] Primary controls are visible and usable.",
    "- [ ] No obvious console or blocking errors appear during basic use.",
    "",
    "## Happy Path Tests",
    `- [ ] Main user flow works: ${mainUserFlow}`,
    "- [ ] Expected success state or output is shown.",
    "- [ ] User can complete the flow without unnecessary steps.",
    "",
    "## Edge Case Tests",
    ...edgeCaseItems.map((edgeCase) => `- [ ] ${edgeCase}`),
    "",
    "## Error Handling Tests",
    "- [ ] Invalid input shows a clear and helpful error message.",
    "- [ ] Required missing input is handled gracefully.",
    "- [ ] The feature recovers after the user corrects an error.",
    "",
    "## Mobile/Responsive Tests",
    "- [ ] Layout works on small screens without horizontal scrolling.",
    "- [ ] Buttons and inputs are easy to tap on mobile.",
    "- [ ] Text remains readable at mobile and desktop sizes.",
    "",
    "## Accessibility Checks",
    "- [ ] Form controls have clear labels.",
    "- [ ] Keyboard navigation reaches all interactive elements.",
    "- [ ] Error and status messages are understandable.",
    "",
    "## Regression Checks",
    "- [ ] Existing related flows still work.",
    "- [ ] Previously fixed bugs around this feature do not return.",
    "- [ ] Shared components or utilities used by this feature still behave correctly.",
    "",
  ].join("\n");
}

function parseList(input: string, fallbackItems: string[]): string[] {
  const items = input
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : fallbackItems;
}
