# AGENTS.md

## Project Overview

FlexFit AI is a static front-end fitness web app. It should stay dependency-free unless the user explicitly asks to convert it to React, Next.js, or another framework.

## File Map

- `index.html`: Page structure and semantic content
- `styles.css`: Visual design, responsive layout, and component styling
- `script.js`: Workout planner, macro calculator, progress tracker, and form behavior
- `README.md`: Human-facing project documentation
- `GEMINI.md`: Antigravity/Gemini-specific context

## Development Rules

- Keep the app runnable by opening `index.html` directly.
- Use semantic HTML and accessible labels for form controls.
- Keep CSS organized by component or section.
- Avoid adding package managers or build steps without updating `README.md`.
- Prefer clear, beginner-readable JavaScript over clever abstractions.
- Test desktop and mobile layouts after visual changes.

## Verification

After changes, verify:

- Navigation links scroll to the correct sections.
- Workout planner renders a new plan after form submit.
- Macro calculator updates calories, protein, carbs, and fat.
- Progress tracker saves and reloads values from `localStorage`.
- Contact form shows a success message and resets.
- Mobile menu opens, closes, and does not overlap content.

## Git Guidance

- Keep commits focused and descriptive.
- Do not commit generated caches, screenshots, or editor folders.
- Before pushing, run `git status --short` and confirm only intended files changed.
