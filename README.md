# FlexFit AI

FlexFit AI is a responsive, dark-themed fitness dashboard covering workouts, nutrition, cardio, an AI coach, and long-term progress tracking. The frontend is a dependency-free static site (`index.html`, `styles.css`, `script.js` - no build step). Two small serverless functions add real AI on top of it: a Gemini-backed Jiya coach chat and a Gemini vision-backed food photo scanner. Both are optional - the app works fully without them, using honest local fallbacks.

## Features

- **Accounts** - real email/password and Google sign-in through Supabase Auth, with a password-strength meter on sign-up. Each user's data lives in one row of the `app_state` table, protected by Row Level Security, so it follows you to any device. First sign-in walks you through profile setup before the dashboard unlocks. **Continue as Guest** always starts from a clean slate, is kept only in the current browser tab (`sessionStorage`), and is discarded on sign-out or tab close.
- **Light / Dark / System theme** - a toggle in the sidebar cycles System -> Light -> Dark. "System" follows your OS's color scheme automatically; the other two override it. Your choice is remembered.
- **Dashboard** - today's calories vs. target, weekly workout count, current/target weight, fitness goal summary, today's training, today's macros, a 7-day calorie chart, and AI-style recommendations.
- **Workout** - opening the page lands on **today's session**: the exercises for the day with a progress bar, a tick box per exercise, how-to and demo links, a **Finish workout** button (fills the bar to 100% and logs the session), remove/add buttons for each exercise, a form to create your own exercises, and "Suggested for you" picks tailored to your sports, goals, level and the day's focus. **Weekly Split** shows the whole week; **AI Regenerate** offers four splits (e.g. Push/Pull/Legs, Upper/Lower, Full Body, Bro Split plus sport-specific ones such as Combat Conditioning or the 10K Runner Plan), and after you choose, a plan guide with how-to and demo links for every exercise appears automatically. **Exercise Library** is searchable and filterable by muscle group. 25 splits cover all 38 supported sports.
- **Food** - a generated daily diet plan with swappable meal alternatives, a photo-based food scanner, a nutrition log with running macro totals, and an ingredient-based "Nutrition AI" meal generator.
- **Cardio** - activity search across categories, a live session timer, MET-based calorie calculation using your profile weight, and session history with running totals.
- **Jiya AI** - a fitness coach chat with suggested prompts (workout plans, meal plans, protein needs, HIIT), multiple saved conversations with a history sidebar (start a new chat, switch back to any past one), each auto-titled from its first message.
- **Progress** - weight history, calories burned, and workout consistency charts, all built from your actual logged workout/cardio/weight data, plus a summary panel.
- **Profile** - multi-select sports and goals, personal details (age, height, weight, target weight, fitness level), which drive the calculated calorie/macro targets shown across the app.

## Technology Stack

- HTML5 (semantic structure, accessible labels)
- CSS3 (custom properties, responsive layout, mobile drawer navigation)
- Vanilla JavaScript on the frontend (no frameworks, no build tools)
- **Supabase** (Auth + Postgres with Row Level Security) for accounts and per-user app state; the browser keeps only Supabase's own session
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
├── workout-data.js           # Extra exercises, the split catalog (25 splits) and exercise form cues
├── supabase-config.js        # Supabase project URL + anon (publishable) key
├── schema.sql                # Run once in Supabase: creates the app_state table + RLS policies
├── tests/
│   └── check-data.js         # Validates every split exercise exists and every sport has a split (node tests/check-data.js)
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

## Accounts Setup (Supabase - email/password + Google)

Accounts are powered by [Supabase](https://supabase.com) (free tier). The Supabase URL and anon (publishable) key are safe in client code - security comes from the Row Level Security policies in `schema.sql`, not from hiding the key. **Never** put the `service_role` key in this project.

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor -> New query**, paste the contents of `schema.sql`, and run it. It creates the `app_state` table (one row per user) with policies so users can only read and write their own row.
3. Open **Project Settings -> API** and copy the **Project URL** and the **anon / publishable** key into `supabase-config.js`.
4. Open **Authentication -> URL Configuration**. Set **Site URL** to your live Netlify URL and add it (plus `http://localhost:3000` if you test locally) under **Redirect URLs**.
5. For Google sign-in: **Authentication -> Providers -> Google** - enable it and paste your Google OAuth Client ID and Secret, then add the Callback URL shown there to your Google Cloud OAuth client's Authorized redirect URIs.
6. Optional: under **Authentication -> Providers -> Email**, turn off "Confirm email" while testing.
7. Commit and push - Netlify redeploys automatically.

Without a Supabase project configured the app still runs: the sign-in form explains this and only **Continue as Guest** works.

## How Data Is Stored

All app state (profile, targets, meals, cardio sessions, completed workouts, weight history, Jiya chats, your chosen workout plan, per-day exercise edits, custom exercises and a change history) is one JSON object saved to the signed-in user's `app_state` row, debounced about half a second after each change. State is merged against sensible defaults on load, so missing or older data never crashes the app. Guests use `sessionStorage` instead (key `flexfit-ai-dashboard-guest-session`) and never read or overwrite a real account's data.

## Limitations

- **Jiya AI coach** - when `/api/jiya` is reachable and `GEMINI_API_KEY` is configured, replies come from Gemini with your profile/targets as context. If the function isn't deployed, isn't configured yet, or the request fails for any reason, the app silently falls back to a local rule-based reply (greetings, protein/calorie/cardio questions, etc.) rather than breaking.
- **Food Scanner** - same pattern: a working `/api/scan-food` returns a real per-photo Gemini vision estimate (items, grams, calories). Without it, you get a clearly-labeled fixed demo estimate, explicitly marked as not a real analysis of your photo.
- **API key exposure trade-off** - the Gemini key is kept server-side specifically to avoid the "key visible in every visitor's browser" problem a pure static site would have. Still use a key with no billing account attached (Gemini's free tier) as a second layer of safety in case the Netlify-side protection is ever misconfigured.
- **"AI Regenerate" (workout) / "Generate Plan" (diet)** - still produce varied, goal-aware results using local logic, not a hosted generative model.

## Future Improvements

- Extend the Gemini integration to generate full workout/diet plans, not just chat and photo scanning.
- Add data export/import so users can back up their progress.
- Add unit tests around the target/macro calculations.
- Add basic rate-limiting in the serverless functions to further protect the Gemini quota.
