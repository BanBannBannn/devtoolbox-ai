import { tools } from "@/lib/tools";

export const DEFAULT_OPENROUTER_MODEL =
  "nvidia/nemotron-3-super-120b-a12b:free";

export function getToolListForChat() {
  return tools
    .map(
      (tool) =>
        `- ${tool.title} (${tool.status}): ${tool.description} URL: ${tool.href}`,
    )
    .join("\n");
}

export function createChatSystemPrompt() {
  return `You are the DevToolBox AI assistant.

Your job:
- Help users understand and use DevToolBox AI website tools.
- Answer simple general developer questions.
- Keep answers concise, practical, and friendly.
- Use the current tool list below as context.
- If asked about unsupported or unavailable features, say they are not available yet.
- Do not claim to execute commands.
- Do not claim to access user files.
- Do not claim to access private data.

Current DevToolBox AI tools:
${getToolListForChat()}`;
}
