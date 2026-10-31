# Prototype scope

Scope approved October 28, 2026. This plan describes the preliminary product,
not a change to the [final-product requirements](requirements.md).

## Included

- A simple form for entering one familiar Mandarin medication phrase and one
  daily reminder time, saved locally; the time does not schedule a notification.
- A Start reminder button to demonstrate the interaction immediately.
- Browser-provided Mandarin spoken prompts and speech recognition, including
  help requests and retries according to the agreed product behavior.
- A Simulate box opening button for one box with persistent local history
  containing only timestamps, as agreed October 29, 2026.
- Keep the initial history implementation in App.tsx without separate logic files.
- Recognized text visible for debugging, without a transcript-review or audio
  playback interface.

Use fictional demonstration data. Standard Mandarin is the expected spoken
language, as confirmed by the project owner. Test the core voice interaction on
actual iPhone/iPad hardware early during implementation; compatibility has not
yet been established.

## Deferred

- Remote access and shared storage.
- Physical sensor hardware integration.
- Protected caregiver editing.
- Automatic notifications.
- Transcript-history review and recording/playback interfaces.

## Evaluation and submission

The elder usability check remains part of acceptance/UAT, not a stakeholder
interview question; see AC-NFR-002 in the
[acceptance criteria](acceptance-criteria.md).

The course submission also needs a runnable artifact, a separate prototype README
with setup, walkthroughs and limitations, stakeholder review documentation and
feedback, an updated brief based on actual findings, and complete artifact/file
accounting. This summary comes from the project owner's course handoff; the
course package has not been independently verified in this repository.
