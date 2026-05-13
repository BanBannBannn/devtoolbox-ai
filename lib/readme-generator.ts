export type GenerateReadmeInput = {
  projectName: string;
  description: string;
  techStack: string;
  installCommand: string;
  runCommand: string;
  features: string;
};

const fallbackProjectName = "Untitled Project";

export function generateReadme(input: GenerateReadmeInput): string {
  const projectName = input.projectName.trim() || fallbackProjectName;
  const description =
    input.description.trim() || "Add a short project description here.";
  const techStack = input.techStack.trim() || "Add your tech stack here.";
  const installCommand = input.installCommand.trim();
  const runCommand = input.runCommand.trim();
  const features = formatFeatures(input.features);

  return [
    `# ${projectName}`,
    "",
    "## Description",
    description,
    "",
    "## Tech Stack",
    techStack,
    "",
    "## Features",
    features,
    "",
    "## Installation",
    formatCommand(installCommand, "Add installation steps here."),
    "",
    "## Usage",
    formatCommand(runCommand, "Add usage instructions here."),
    "",
    "## License",
    "Add license information here.",
    "",
  ].join("\n");
}

function formatFeatures(features: string): string {
  const featureItems = features
    .split("\n")
    .map((feature) => feature.trim())
    .filter(Boolean);

  if (featureItems.length === 0) {
    return "Add your project features here.";
  }

  return featureItems.map((feature) => `- ${feature}`).join("\n");
}

function formatCommand(command: string, fallback: string): string {
  if (!command) {
    return fallback;
  }

  return ["```bash", command, "```"].join("\n");
}
