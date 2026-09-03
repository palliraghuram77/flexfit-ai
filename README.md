# FlexFit AI

FlexFit AI is a responsive, dark-themed fitness dashboard covering workouts, nutrition, cardio, an AI coach, and long-term progress tracking. The frontend is a dependency-free static site (`index.html`, `styles.css`, `script.js` - no build step). Two small serverless functions add real AI on top of it: a Gemini-backed Jiya coach chat and a Gemini vision-backed food photo scanner. Both are optional - the app works fully without them, using honest local fallbacks.

## Features

- **Sign In / Create Account** - a local demo gate (name + email, "Sign in with Google", or "Continue as Guest") that walks first-time users through profile setup before unlocking the dashboard. Signing in with a name/email or Google remembers your data on this device; signing out returns to this screen without deleting it. **Continue as Guest** is different on purpose: it always starts from a completely clean, unonboarded slate, is stored only for the current browser tab, and is discarded on sign-out or tab close - it never reads or overwrites a signed-in account's saved profile.
- **Light / Dark / System theme** - a toggle in the sidebar cycles System -> Light -> Dark. "System" follows your OS's color scheme automatically; the other two override it. Your choice is remembered.
- **Dashboard** - today's calories vs. target, weekly workout count, current/target weight, fitness goal summary, today's training, today's macros, a 7-day calorie chart, and AI-style recommendations.
- **Workout** - a weekly split with current-day highlighting and completion tracking, an "AI Regenerate" action, and a searchable/filterable exercise library with sets/reps, rest period, muscles worked, and a quick how-to dialog per exercise.
- **Food** - a generated daily diet plan with swappable meal alternatives, a photo-based food scanner, a nutrition log with running macro totals, and an ingredient-based "Nutrition AI" meal generator.
- **Cardio** - activity search across categories, a live session timer, MET-based calorie calculation using your profile weight, and session history with running totals.
- **Jiya AI** - a fitness coach chat with suggested prompts (workout plans, meal plans, protein needs, HIIT), multiple saved conversations with a history sidebar (start a new chat, switch back to any past one), each auto-titled from its first message.
- **Progress** - weight history, calories burned, and workout consistency charts, all built from your actual logged workout/cardio/weight data, plus a summary panel.
- **Profile** - multi-select sports and goals, personal details (age, height, weight, target weight, fitness level), which drive the calculated calorie/macro targets shown across the app.

## Technology Stack

- HTML5 (semantic structure, accessible labels)
- CSS3 (custom properties, responsive layout, mobile drawer navigation)
- Vanilla JavaScript on the frontend (no frameworks, no build tools)
- Browser `localStorage` for all app state/persistence
- **Netlify Functions** (`netlify/functions/jiya.js`, `netlify/functions/scan-food.js`) - the only server-side code, used solely to keep the Gemini API key off the client
- **Google Gemini API** (`gemini-3.6-flash`, text + vision) for Jiya's replies and the food scanner
- Git + Netlify for version control and deployment

No package manager or bundler is needed anywhere in this project. The two serverless functions are plain Node.js files with zero npm dependencies - they use the runtime's built-in `fetch`.

## Project Structure

```
.
├── index.html               # Page structure - auth/onboarding + sidebar/mobile nav + all app screens
├── styles.css                # Visual design, theming, and responsive layout
├── script.js                 # State, rendering, auth/onboarding gate, and all interactive behavior
├── netlify/
│   └── functions/
│       ├── jiya.js           # Netlify function - Gemini-backed Jiya chat reply
│       └── scan-food.js      # Netlify function - Gemini vision-backed food photo analysis
├── netlify.toml               # Netlify build config + /api/* -> functions redirect
├── .env.example               # Documents the GEMINI_API_KEY env var (no real key committed)
├── AGENTS.md                  # Shared coding rules for AI coding agents
├── GEMINI.md                  # Antigravity/Gemini-specific project context
├── .gitignore
└── README.md
```

## Running Locally

No installation needed for the frontend:

1. Clone or download this repository.
2. Open `index.html` directly in a browser.

Without the serverless functions running, Jiya and the food scanner automatically use their local fallback logic (see **Limitations** below) - everything else works identically either way. To run the AI-backed versions locally, install the [Netlify CLI](https://docs.netlify.com/cli/get-started/) and run `netlify dev` from the project root with a `.env` file containing your key (see **AI Setup** below).

## AI Setup (Gemini via Netlify)

The Gemini API key must never be committed to the repo or shipped to the browser - it lives only in Netlify's server-side environment variables, which the functions read at request time.

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Push this repository to GitHub (the code still lives on GitHub - only the *live hosting* moves to Netlify, since GitHub Pages can't run server-side functions).
3. In [Netlify](https://app.netlify.com), click **Add new site → Import an existing project** and connect the GitHub repo. Netlify auto-detects `netlify.toml`, the static root, and the `netlify/functions` folder - no build command needed.
4. Go to **Site configuration → Environment variables** and add:
   - `GEMINI_API_KEY` = your key
5. Deploy (or trigger a redeploy after adding the variable). Your live site is now at `https://<your-site-name>.netlify.app`.

That's it - `script.js` already calls `/api/jiya` and `/api/scan-food`, `netlify.toml` redirects those to the functions, and the app will use real Gemini responses automatically once the key is set.

## Google Sign-In Setup (optional)

Unlike the Gemini key, a Google OAuth Client ID is a public value - it's safe to commit and put directly in `script.js`. Without it, the "Sign in with Google" button on the sign-in screen just shows a note explaining it isn't configured yet; nothing breaks.

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an OAuth client ID of type **Web application**.
3. Under **Authorized JavaScript origins**, add both `http://localhost` (for local testing) and your live Netlify URL, e.g. `https://your-site-name.netlify.app`.
4. Copy the generated Client ID.
5. Open `script.js`, find the line `const GOOGLE_CLIENT_ID = "";` near the bottom, and paste your Client ID between the quotes.
6. Commit and push - the button will now render and work on any origin you listed in step 3.

This is a local-only demo sign-in, same as the email/guest options: no server verifies the Google token, it's just decoded in the browser to grab a display name.

## How `localStorage` Is Used

All app state for a signed-in (name/email or Google) user lives under a single `localStorage` key, `flexfit-ai-dashboard`, as one JSON object containing:

- session (signed in or not, and a display name) and an `onboarded` flag
- profile (sports, goals, age, height, weight, target weight, fitness level)
- calculated calorie/macro targets
- logged meals, cardio sessions, completed workouts, and weight history
- saved ingredients for the AI meal generator
- `jiyaChats`: an array of saved Jiya conversations (id, title, created date, messages) plus `activeChatId` for which one is open
- a few UI flags (e.g. whether a diet plan has been generated)

State is loaded once on startup and merged against sensible defaults, so missing or corrupted `localStorage` data never crashes the app - it falls back to defaults instead. Every user action re-saves the whole state object immediately, so a page refresh always restores where you left off. An older single flat `chat` array (pre chat-history) is migrated automatically into one `jiyaChats` entry the first time it's loaded.

**Continue as Guest** uses a separate, `sessionStorage`-backed key (`flexfit-ai-dashboard-guest-session`) instead of the `localStorage` one above. It always starts from `defaultState()` - unonboarded, no profile, no chats - so a guest never sees (or overwrites) a signed-in user's saved data, on this device or any other. It's cleared on sign-out or when the tab closes.

## Limitations

- **Jiya AI coach** - when `/api/jiya` is reachable and `GEMINI_API_KEY` is configured, replies come from Gemini with your profile/targets as context. If the function isn't deployed, isn't configured yet, or the request fails for any reason, the app silently falls back to a local rule-based reply (greetings, protein/calorie/cardio questions, etc.) rather than breaking.
- **Food Scanner** - same pattern: a working `/api/scan-food` returns a real per-photo Gemini vision estimate (items, grams, calories). Without it, you get a clearly-labeled fixed demo estimate, explicitly marked as not a real analysis of your photo.
- **API key exposure trade-off** - the Gemini key is kept server-side specifically to avoid the "key visible in every visitor's browser" problem a pure static site would have. Still use a key with no billing account attached (Gemini's free tier) as a second layer of safety in case the Netlify-side protection is ever misconfigured.
- **"AI Regenerate" (workout) / "Generate Plan" (diet)** - still produce varied, goal-aware results using local logic, not a hosted generative model.
- **Sign In / Create Account** - a local-only demo gate. Nothing is sent to a server for auth; it just marks a session active in `localStorage`. "Sign in with Google" uses Google's own client-side sign-in widget and decodes the returned token in the browser (no server-side verification) - fine for a demo, not a substitute for real backend-verified auth.

## Future Improvements

- Extend the Gemini integration to generate full workout/diet plans, not just chat and photo scanning.
- Add data export/import so progress isn't tied to a single browser's storage.
- Add unit tests around the target/macro calculations.
- Add basic rate-limiting in the serverless functions to further protect the Gemini quota.
