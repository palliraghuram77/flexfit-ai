# AGENTS.md

## Project Overview

FlexFit AI is a static front-end fitness web app (HTML/CSS/vanilla JS). It stays dependency-free on the frontend. The one deliberate exception: two small Netlify serverless functions under `netlify/functions/` proxy calls to the Gemini API so the API key never reaches the browser. Do not move the frontend itself to React/Next.js/Vue unless explicitly asked.

## File Map

- `index.html`: Page structure and semantic content, including the sign-in/onboarding screens
- `styles.css`: Visual design, responsive layout, and component styling
- `script.js`: Auth/onboarding gate, workout planner, macro calculator, progress tracker, Jiya chat, food scanner, and form behavior
- `netlify/functions/jiya.js`: Netlify serverless function - Gemini-backed chat reply for Jiya AI
- `netlify/functions/scan-food.js`: Netlify serverless function - Gemini vision-backed food photo analysis
- `netlify.toml`: Build config and the `/api/*` -> `/.netlify/functions/:splat` redirect the frontend relies on
- `.env.example`: Documents the `GEMINI_API_KEY` env var required by the two functions above (real value goes in Netlify's dashboard, never committed)
- `README.md`: Human-facing project documentation
- `GEMINI.md`: Antigravity/Gemini-specific context

## Development Rules

- Keep the app runnable by opening `index.html` directly - if `/api/*` isn't reachable (no server, or the key isn't configured), the app must fall back to its local rule-based Jiya replies and demo scan result rather than breaking.
- Never put the real Gemini API key in any committed file. It lives only in Netlify's environment variables.
- Use semantic HTML and accessible labels for form controls.
- Keep CSS organized by component or section.
- Avoid adding package managers or frontend build steps without updating `README.md`.
- Prefer clear, beginner-readable JavaScript over clever abstractions.
- Test desktop and mobile layouts after visual changes.

## Verification

After changes, verify:

- Sign in (or Continue as Guest) gates the app; first sign-in forces profile setup before the dashboard is reachable.
- Sign out returns to the sign-in screen without deleting saved data; signing back in skips onboarding.
- Navigation links scroll to the correct sections.
- Workout planner renders a new plan after form submit.
- Macro calculator updates calories, protein, carbs, and fat.
- Progress tracker saves and reloads values from `localStorage`.
- Jiya AI replies sensibly to greetings, real questions, and nonsense input (no repeated canned line for everything).
- Food scanner returns a real per-photo AI estimate when `/api/scan-food` is configured, and a clearly-labeled demo estimate when it isn't.
- Mobile menu opens, closes, and does not overlap content.

## Git Guidance

- Keep commits focused and descriptive.
- Do not commit generated caches, screenshots, editor folders, `.env`, or `.netlify/`.
- Before pushing, run `git status --short` and confirm only intended files changed.
