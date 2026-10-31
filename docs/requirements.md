# Medication Reminder and Logging System — Requirements

Status: Working baseline, agreed through project discussion on October 27, 2026.

## Purpose and users

The system supports an elder who has difficulty remembering whether medication
was taken and a family caregiver who cannot check in in person every day. It
should support the elder's independence and dignity through a simple Mandarin
voice interaction and allow the caregiver to review the routine remotely.

These requirements describe the final product. Prototype scope, implementation
tasks, and development milestones will be documented separately. The product is
intended for one elder and their caregiver, rather than a general service for
multiple households.

## Functional requirements

| ID | Name | Requirement |
| --- | --- | --- |
| FR-001 | Medication configuration | The system shall permit only the authorized caregiver to create or edit medication names, reminder schedules, and associated medication-box configuration. |
| FR-002 | Reminder and recall interaction | The system shall deliver a push-style notification at each scheduled medication time, including when the application is not open or the device is locked. If the reminder goes unanswered, it shall send one follow-up after a configurable or agreed interval and no further reminders for that scheduled occurrence. The reminder interaction shall prompt the primary user in spoken Mandarin to recall the scheduled medication, accept a spoken answer or verbal request for help, and provide a predefined response based on the configured schedule. |
| FR-003 | Voice records | The system shall support microphone recording, audio playback, Mandarin speech recognition, and saved transcripts linked to the relevant reminder interaction. Audio recordings and text transcripts shall be automatically deleted no later than 14 days after their creation. |
| FR-004 | Box-opening records | The system shall receive medication-box sensor events and record each opening's timestamp for a single medication box; box IDs, source labels, and unique event IDs are not required. An opening shall not be presented as confirmation that medication was taken. |
| FR-005 | Shared history | The system shall allow the primary user and caregiver to review reminder interactions and box-opening history concurrently from geographically separate devices, with an indication of when information was last synchronized. |
| FR-006 | Interaction recovery | The system shall allow users to repeat prompts, ask for another answer when speech is unclear, provide the scheduled medication information when the elder requests help or says they do not know, and support essential interactions without speech input, including a control to request the answer. |

## Non-functional requirements

| ID | Name | Requirement |
| --- | --- | --- |
| NFR-001 | Device compatibility | The system shall support desktop browsers, iPhone Safari, and iPad Safari through layouts and controls suited to each device. |
| NFR-002 | Accessibility and elder usability | The interface shall meet WCAG 2.2 Level AA and accommodate older adults with reduced vision, hearing, dexterity, or memory through readable text, generous touch targets, simple language, consistent navigation, minimal task steps, and visual equivalents of spoken information. Usability shall be evaluated with the intended primary user. |
| NFR-003 | Reliability and resilience | The system shall preserve recorded events across restarts and temporary connectivity interruptions without silent loss or duplication, clearly communicate unavailable features, and meet agreed reminder-timing and synchronization-delay targets. |
| NFR-004 | Private access and data protection | The system shall limit access to personal medication information to approved devices or people, prevent unauthorized schedule changes, and protect information during transmission and storage. |
| NFR-005 | Medication guidance boundaries | The system shall base medication-related responses on configured information and predefined wording, without independently selecting medication, determining doses, or generating medical advice. |

## Agreed behavior details

- The caregiver shall enter the familiar medication phrase used by the elder
  when configuring a schedule; it need not be the official medication name.
  Stakeholder confirmation of actual phrases and acceptable variants is pending.
  A reference voice recording is an optional idea, not a requirement.
- For a clearly recognized but incorrect medication answer, allow one retry,
  then provide the configured answer if the retry is also incorrect. This is a
  provisional choice pending stakeholder feedback and is separate from the
  two-attempt limit for unclear recognition.
- Send the single follow-up notification 10 minutes after the initial reminder
  if its notification has not been opened.
- After two unsuccessful speech attempts caused by unclear recognition, offer
  the scheduled answer automatically. Help remains available at any time.
- Box-opening history shall not be automatically deleted. If removal is needed,
  it may be performed manually through authorized database administration; an
  in-app history deletion feature is not required.
- Reminder delivery should occur within one minute of its scheduled time when
  online with notifications enabled; up to five minutes is acceptable if it
  simplifies implementation. Do not introduce delay solely to use the tolerance.
- Box-opening events must be available in shared history within one hour when
  connectivity is available, preserving the actual opening time. Record and
  share promptly where practical; caregiver event alerts are not required.
- After a brief introduction, the elder should be able to open a reminder,
  answer or request help, and replay the answer without caregiver assistance.

## Intended reminder interaction

1. At a scheduled time, ask the primary user in Mandarin whether they remember
   which medication is scheduled.
2. Allow the user to answer aloud or request help.
3. Compare the recognized answer with the configured schedule.
4. Provide a predefined Mandarin response, including the scheduled medication
   information when help is requested or the elder says they do not know. If the
   answer is unclear, ask the elder to answer again.
5. Record any box opening as a separate event. Neither a spoken answer nor a box
   opening establishes that medication was taken.

Opening a reminder notification counts as answering that scheduled reminder and
suppresses its follow-up notification. This acknowledgement does not establish
that the voice interaction was completed or medication was taken. Opening either
the initial notification or its follow-up acknowledges the same scheduled
reminder occurrence.

## Technology preferences and access approach

- Start prototype speech recognition with the browser-provided capability as
  the simplest initial approach; actual device behavior remains to be tested.
  Prefer solutions without recurring operating costs and do not introduce a
  paid external service without discussing the tradeoff with the project owner.
- React, TypeScript, and Vite are a provisional implementation preference, not
  product requirements. They may be replaced if another approach better meets
  the product requirements, particularly device compatibility, voice support,
  and reminder reliability.
- General account administration is not required. Caregiver schedule editing
  must be protected by a password or another suitable authorization mechanism;
  the exact mechanism remains to be selected. Private access remains required.
- A public source repository must not contain real personal medication data,
  recordings, credentials, or private access links.

## Acceptance details still to define

- Detailed device compatibility criteria are deferred.
- Offline behavior and detailed accessibility checks.
- Medication-name matching rules and behavior when recognition is uncertain.
- How caregiver editing access is approved, revoked, or recovered after a
  device is lost.
- How the 14-day audio and transcript deletion limit is enforced across devices,
  offline copies, and backups.

## Feasibility and data decisions still to validate

- Test Mandarin speech synthesis, microphone recording/playback, and speech
  recognition on actual target iPhone and iPad devices. No device testing has
  been completed yet. Define the detailed non-voice flow when permission is
  denied or a capability is unavailable.
- Validate push-style reminders with the application closed and the device
  locked before committing to an implementation approach.
- Box-opening records contain only a timestamp for the single box. Transcripts link
  to reminder interactions; any link between an interaction and an opening must
  remain distinct from proof of medication intake.
- Define record identifiers, timestamp conventions, recording storage and links,
  deletion behavior, and local persistence semantics in a separate data design.
  Simulation and local-only prototype choices are not final-product requirements.

## Maintaining this document

Keep requirement IDs stable after this baseline. Update wording when a
requirement changes; retire an ID rather than reusing it for unrelated behavior.
Acceptance criteria and implementation tasks should reference these IDs.

See [acceptance criteria](acceptance-criteria.md) for observable checks and
criteria awaiting decisions.

Background: [stakeholder and assignment brief](../course/milestone-1/brief.md). Where the earlier
brief leaves choices open, this document records the current product direction.
