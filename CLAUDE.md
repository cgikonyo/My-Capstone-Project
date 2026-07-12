# Project conventions

Read this file before making architectural suggestions or multi-file refactors.

## Stack

- Runtime: Node.js LTS
- Package manager: npm
- IDE: Cursor with AI-assisted development

## Repository layout

- `README.md` — project overview and setup instructions
- `LICENSE` — MIT license
- `package.json` — Node.js manifest and scripts
- `.gitignore` — files that must not be committed

## Code style

- Use clear, descriptive names for files and functions
- Keep changes small and focused
- Prefer async/await for asynchronous code
- Match existing formatting in the file you edit

## Git

- Use [Conventional Commits](https://www.conventionalcommits.org/) for all commit messages
- One logical change per commit
- Do not commit secrets, `.env` files, or `node_modules/`

## Cursor usage

- Read this file before suggesting architecture or refactors
- Propose minimal diffs; do not change unrelated code
- Use Agent mode for multi-file tasks; Chat for reviews and questions
- Run relevant commands (install, test, lint) before claiming a task is done
