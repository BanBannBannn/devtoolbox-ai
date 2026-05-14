export type GitGoal =
  | "check status"
  | "create a new branch"
  | "switch branch"
  | "add all changes"
  | "commit changes"
  | "push branch"
  | "pull latest changes"
  | "see commit history"
  | "undo last commit but keep changes"
  | "discard local file changes";

export type GetGitCommandHelpInput = {
  goal: GitGoal;
  branchName?: string;
  commitMessage?: string;
  filePath?: string;
};

export type GitCommandHelpResult = {
  command: string;
  explanation: string;
  warning?: string;
  isRisky: boolean;
};

const fallbackBranchName = "branch-name";
const fallbackCommitMessage = "Describe your changes";
const fallbackFilePath = "path/to/file";

export function getGitCommandHelp(
  input: GetGitCommandHelpInput,
): GitCommandHelpResult {
  const branchName = input.branchName?.trim() || fallbackBranchName;
  const commitMessage = input.commitMessage?.trim() || fallbackCommitMessage;
  const filePath = input.filePath?.trim() || fallbackFilePath;

  switch (input.goal) {
    case "check status":
      return {
        command: "git status",
        explanation:
          "Shows the working tree status, including changed files, staged files, and untracked files.",
        isRisky: false,
      };

    case "create a new branch":
      return {
        command: `git checkout -b ${branchName}`,
        explanation: `Creates a new branch named ${branchName} and switches to it.`,
        isRisky: false,
      };

    case "switch branch":
      return {
        command: `git checkout ${branchName}`,
        explanation: `Switches your working directory to the ${branchName} branch. Commit or stash current work first if Git warns about conflicts.`,
        isRisky: false,
      };

    case "add all changes":
      return {
        command: "git add .",
        explanation:
          "Stages all changed, deleted, and new files in the current directory so they can be included in the next commit.",
        isRisky: false,
      };

    case "commit changes":
      return {
        command: `git commit -m "${commitMessage}"`,
        explanation:
          "Creates a commit from your staged changes using the provided commit message.",
        isRisky: false,
      };

    case "push branch":
      return {
        command: `git push -u origin ${branchName}`,
        explanation: `Pushes the ${branchName} branch to origin and sets it as the upstream branch for future pushes.`,
        isRisky: false,
      };

    case "pull latest changes":
      return {
        command: "git pull",
        explanation:
          "Fetches and merges the latest changes from the current branch's configured remote branch.",
        isRisky: false,
      };

    case "see commit history":
      return {
        command: "git log --oneline --decorate --graph",
        explanation:
          "Shows a compact commit history with branch labels and a simple graph.",
        isRisky: false,
      };

    case "undo last commit but keep changes":
      return {
        command: "git reset --soft HEAD~1",
        explanation:
          "Moves the last commit back into staged changes, so your file changes are kept and can be recommitted.",
        warning:
          "This rewrites local commit history. Use it carefully, especially if the commit was already pushed.",
        isRisky: true,
      };

    case "discard local file changes":
      return {
        command: `git checkout -- ${filePath}`,
        explanation: `Discards local changes in ${filePath}. Uncommitted changes may be lost and cannot always be recovered.`,
        warning:
          "This can permanently discard uncommitted work in the selected file. Make sure you do not need those changes before running it.",
        isRisky: true,
      };
  }
}
