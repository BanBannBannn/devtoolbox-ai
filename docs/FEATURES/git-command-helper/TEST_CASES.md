# Git Command Helper Test Cases

## TC-001: Check status
Input:
- Goal: Check status

Expected:
- Command contains `git status`.
- Explanation mentions working tree or changed files.

## TC-002: Create branch
Input:
- Goal: Create a new branch
- Branch name: feature/json-formatter

Expected:
- Command contains `git checkout -b feature/json-formatter`.

## TC-003: Undo last commit but keep changes
Input:
- Goal: Undo last commit but keep changes

Expected:
- Command contains `git reset --soft HEAD~1`.
- Warning is shown.

## TC-004: Discard local changes
Input:
- Goal: Discard local file changes

Expected:
- Warning is shown.
- Explanation says changes may be lost.
