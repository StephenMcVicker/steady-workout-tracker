# Steady

Mobile-first, device-local push / pull / legs workout tracker.

## Develop

Requires Node 22.13+.

```sh
npm install
npm run dev
```

React 19, TypeScript, Tailwind CSS 4, shadcn/ui and Lucide icons. The app is a static React single-page application built with Vite. No backend, authentication, database, analytics, or external runtime data requests.

## Build

```sh
npm run build
```

Configured as a static export for future hosting. The app manifest and production service worker provide home-screen installation over HTTPS (or localhost). The production build precaches the app shell, code, icons, and every exercise photo for offline use after the first successful online load. Service workers are disabled during development. Production cache versions are derived from the build contents.

## Behaviour

- Four routines: Push, Pull, Legs, and Full Body, sharing ten exercises. Each set records kg and actual reps.
- Completing a set advances within the exercise. The final set returns to the routine, with completed exercises grouped below To do. Once every exercise is complete, a celebration replaces the list. Sets can be edited or undone while the exercise is in progress. An exercise locks once all its sets are complete.
- Each category keeps its own unfinished session across reloads.
- Choose a local calendar date (today by default); dates can be changed before finishing. Old saved sessions remain compatible.
- Finish all sets to view a summary and archive a session. Starting again uses the last recorded exercise weight.
- Progress is stored only in this browser's localStorage, under `steady-workouts-v1`. Clearing site data removes it. No cross-device sync; changing the site origin creates a separate store. Avoid editing the same session in multiple tabs.
- Invalid stored data is preserved and shown as a warning; new changes stay in memory in that case.
- Optional read-only WebMCP tool: `read_workout_progress`, feature detected at runtime.

## Exercise choices

Cable low-to-high flies become incline dumbbell flies, tricep pushdowns become overhead dumbbell extensions, and pulldowns become dumbbell pullovers. These target related muscles, not identical mechanics. Goblet squats and RDLs use dumbbells by default; their reference photos show kettlebell and barbell variations, explicitly labelled in the exercise view.

The kg defaults are conservative editable examples, not medical guidance or age-specific prescriptions. Bodyweight lunges start at zero; paired weights are per dumbbell. Single dumbbell movements are total weight. Lunge reps are per leg. The suggested three-set routine is adjustable in `lib/workouts.ts`.

General form and gradual-loading reference: https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/weight-training/art-20045842

## Image credits

Exercise reference photos from Free Exercise DB: https://github.com/yuhonas/free-exercise-db — distributed by that project as an Unlicense/public-domain dataset. The repository's upstream image-provenance discussions should be reviewed before commercial publication. Photos are bundled locally; no external image tracking. Lucide icons are ISC licensed. No generated exercise imagery.

## Validation

Production build, TypeScript check and browser workflow checks are run before publication. Run `npm test` for session isolation, storage validation, and round-trip checks. Browser checks cover edited set completion, reload persistence, undo, category switching, and finishing a session.

The home screen plans or resumes a session. History is sorted by the chosen workout date and opens the same read-only summary as finishing a workout. Next-time targets use logged reps and weights; any load increase is conditional on how the sets felt.

## GitHub Pages

Public site: https://stephenmcvicker.github.io/steady-workout-tracker/

Pushes to `main` run tests and build a static site, then deploy it using GitHub Actions. In repository Settings → Pages, select GitHub Actions as the source. No secrets or backend services are needed.

The workflow sets `NEXT_PUBLIC_BASE_PATH=/steady-workout-tracker`. Local development leaves this unset and continues at http://localhost:5173/. To build locally for the hosted path:

```sh
NEXT_PUBLIC_BASE_PATH=/steady-workout-tracker npm run build
```

On iPhone/iPad, open the site in Safari and use Share → Add to Home Screen. On Android, open it in Chrome and use the browser menu's install option. Open once online to cache the app and exercise photos for offline use.

Workout history stays in the browser where it was entered. The hosted site and localhost have separate storage; publishing the app does not publish or transfer local workout history.
