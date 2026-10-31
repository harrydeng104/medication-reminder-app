# medication-reminder-app

## Development

Requires Node.js compatible with Vite 8 (`^20.19.0` or `>=22.12.0`) and npm.
The initial setup was verified with Node.js 22.17.0 and npm 10.9.2.

```sh
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

On Windows PowerShell, use `npm.cmd` instead of `npm` if script execution policy
blocks the npm PowerShell wrapper. The build command includes TypeScript checks.
Preview serves an existing production build; it does not build it first.

The application includes an unprotected medication setup form for one familiar
Mandarin phrase and one daily time, saved locally under
`medication-reminder.medication`. The time is stored only; notifications are not
scheduled. The form displays the saved configuration and load/save errors.

It also provides a Simulate box opening button and a newest-first
history for one box. It stores only timestamps in browser localStorage under
`medication-reminder.openings`. History persists in the same browser unless site
data is cleared; it is not shared across devices or synchronized between open
tabs. Load/save failures are shown on screen. No physical sensor is connected.

After saving a medication, Start reminder displays and speaks a Mandarin recall
prompt using browser speech synthesis with `zh-CN`. Repeat prompt replays the
question; Show answer displays and speaks the saved medication phrase. Visible
text remains available if speech is unsupported or reports an error. Actual voice
availability and playback on iPhone/iPad have not yet been verified.

Answer aloud starts browser-provided Mandarin recognition and displays recognized
text; Done speaking ends capture. Continuous recognition collects multiple phrases
within each session, starting a fresh transcript for each attempt. Initial silence has a
5-second limit, canceled when speech is detected; each started session has a
60-second limit. The browser can end recognition earlier. Bilingual Mandarin and
English controls/status explain when listening starts or ends; no silence
countdown or automatic restart is implemented. Timers are cleared on stop, error,
end, or component cleanup. Permission and recognition failures are shown
on screen. After a session ends successfully, the app evaluates its final text
once: a normalized substring match accepts the saved medication phrase, listed
Mandarin help expressions reveal the answer, and unmatched text gets one retry
before the configured answer is provided. This is a basic heuristic without
negation handling or general intent understanding; it can misclassify responses.
Empty/failed sessions do not count as unmatched answers. Replaying a prompt or
showing the answer cancels pending evaluation; a new reminder resets retries.
The app does not save audio or transcripts. The separate final-product behavior
for two unclear-recognition attempts has not yet been implemented.
Browser recognition may send audio to its provider's service; it is not guaranteed
to run locally. No speech packages, paid API integrations, or automatic
notifications have been added. Recognition requires actual device testing.

Application code is in `src/`,
static public assets are in `public/`, and production output goes to `dist/`.
Formatting tooling has not been configured yet.

## Deployment

GitHub Pages configuration is prepared in `.github/workflows/deploy.yml`.
Enable Settings → Pages → GitHub Actions, then push to `main` or manually run
the workflow. It installs dependencies, lints, builds, and publishes only `dist/`.
Deployment has not yet been run or verified.

The configured base path is `/medication-reminder-app/`, including for local
development/preview URLs. The expected deployed address is
`https://harrydeng104.github.io/medication-reminder-app/`.
Local course materials in `course/` are excluded from Git.

## Project documents

- [Product requirements](docs/requirements.md)
- [Acceptance criteria](docs/acceptance-criteria.md)
- [Stakeholder questions](docs/stakeholder-questions.md)
- [Prototype scope](docs/prototype-plan.md)
- [Milestone 1 stakeholder and assignment brief](course/milestone-1/brief.md)
