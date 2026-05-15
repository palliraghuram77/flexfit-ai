# FlexFit AI

FlexFit AI is a portfolio-ready fitness web app inspired by an AI-generated Base44 landing page and rebuilt as clean, editable front-end code. It is designed to be easy to publish on GitHub Pages and easy for AI coding tools such as Antigravity, Codex, Cursor, and Gemini CLI to understand.

## Live Project Features

- Responsive fitness landing page with mobile navigation
- AI-style workout planner based on goal, level, equipment, and training days
- Calorie and macro calculator using client-side JavaScript
- Weekly progress tracker saved with `localStorage`
- Testimonials, contact form demo, and polished portfolio copy
- No build step required

## Tech Stack

- HTML5 for semantic page structure
- CSS3 for responsive layout, design tokens, media queries, and animations
- JavaScript for dynamic planner, calculator, form handling, and local storage
- Git and GitHub for version control and project hosting

## How To Run Locally

Open `index.html` directly in your browser.

You can also serve the folder with any static server if you prefer:

```bash
python -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

## GitHub Upload Steps

```bash
git init
git add .
git commit -m "Build FlexFit AI portfolio website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/flexfit-ai.git
git push -u origin main
```

## GitHub Pages Deployment

1. Push this folder to a GitHub repository.
2. Go to repository `Settings`.
3. Open `Pages`.
4. Set source to `Deploy from a branch`.
5. Select `main` and `/root`.
6. Save and wait for GitHub to publish the site.

## Antigravity Compatibility

This project includes:

- `AGENTS.md` for cross-tool AI coding instructions
- `GEMINI.md` for Antigravity/Gemini-specific project context
- Simple static file structure that an agent can inspect without package installation
- Clear test and verification steps

Open the folder in Antigravity and ask it to read `README.md`, `AGENTS.md`, and `GEMINI.md` before making changes.

## Resume Bullets

- Built a responsive AI fitness web app using HTML, CSS, and JavaScript with workout planning, macro calculation, and local progress tracking.
- Implemented client-side state management with `localStorage`, form validation, responsive navigation, and accessible semantic HTML.
- Prepared the project for GitHub Pages deployment with developer documentation and AI-agent instructions for Antigravity-compatible workflows.

## Technical Skills Needed

To build and improve this project, focus on:

- Front-end fundamentals: HTML, CSS, JavaScript
- Responsive design: flexbox, grid, media queries, spacing systems
- DOM manipulation: events, forms, dynamic rendering
- Browser storage: `localStorage`
- UX thinking: user journeys, clear labels, accessible forms
- Git/GitHub: commits, branches, remotes, GitHub Pages
- AI IDE workflow: giving clear prompts, reading generated diffs, testing changes

## Credits

Hero image from Unsplash: `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b`
