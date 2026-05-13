# Git Command Helper SPEC

## Goal
Build a safe browser-based Git command helper for common beginner Git tasks.

## URL
`/tools/git-command-helper`

## User Story
As a beginner developer, I want to choose what I want to do in Git and see the command, so that I can learn common Git workflows.

## Functional Requirements
- User can select a goal from predefined options.
- Tool shows suggested Git command.
- Tool explains what the command does.
- Tool warns users to understand commands before running them.
- Tool does not execute commands.
- Tool runs fully in the browser.

## Predefined Goals
- Check status.
- Create a new branch.
- Switch branch.
- Add all changes.
- Commit changes.
- Push branch.
- Pull latest changes.
- See commit history.
- Undo last commit but keep changes.
- Discard local file changes.

## Safety Requirements
- Do not include destructive commands without warning.
- Do not run any command.
- For risky commands, show a warning.

## Acceptance Criteria
- Selecting a goal shows the right command.
- Explanation is beginner-friendly.
- Risky commands show warnings.
- Tool works on mobile.
