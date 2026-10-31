# Acceptance criteria

Each [product requirement](requirements.md) has one acceptance entry with its related checks. This consolidated baseline replaces the earlier AC numbering. Prototype checks will be documented separately.

## Functional requirements

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| AC-FR-001 | FR-001 | Only the authorized caregiver can create or edit medication names, schedules, and box configuration. Unauthorized attempts leave configuration unchanged. |
| AC-FR-002 | FR-002 | A scheduled notification leads to a Mandarin recall prompt, accepts a spoken answer or verbal help request, and gives a predefined schedule-based response. Opening the notification acknowledges the occurrence and cancels its pending follow-up; otherwise exactly one follow-up is scheduled 10 minutes later. No third notification is sent. Acknowledgement is not medication intake. |
| AC-FR-003 | FR-003 | Recording, playback, and Mandarin recognition work, with saved transcripts linked to reminder interactions. Audio and transcripts are automatically deleted within 14 days of creation and cannot subsequently be retrieved or played. |
| AC-FR-004 | FR-004 | Each sensor opening of the single box creates one event containing only its actual timestamp, labeled as an opening rather than confirmed medication intake. Events never expire automatically; removal requires authorized database administration, with no in-app deletion control required. |
| AC-FR-005 | FR-005 | The elder and caregiver can concurrently review shared reminder interactions and opening history from geographically separate devices and see when information was last synchronized. No caregiver event alert is required. |
| AC-FR-006 | FR-006 | Prompts can be repeated and help requested in Mandarin or on screen. Mandarin responses expressing uncertainty, inability to recall, or a request for help produce the scheduled answer without requiring an exact phrase. Unclear speech prompts another attempt; after two unclear attempts the answer is offered automatically. Denied microphone access produces an explanation while on-screen help and unaffected features remain usable. |

## Non-functional requirements

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| AC-NFR-001 | NFR-001 | The primary-user reminder and voice workflow works on iPhone and iPad, and caregiver configuration and history review work on desktop browsers. Supported screens display readable content and usable controls without clipping or unintended horizontal scrolling. Supporting both roles on every device is preferred but not required if separate device workflows simplify implementation. One-time installation of the web app to the Home Screen is acceptable. Specific browser/OS versions remain undecided. |
| AC-NFR-002 | NFR-002 | Essential spoken information has visible equivalents and essential actions work without speech. After a brief introduction, the elder can open a reminder, answer or request help, and replay the answer without caregiver assistance. An accessibility review finds no unresolved WCAG 2.2 Level A or AA failures. |
| AC-NFR-003 | NFR-003 | Saved events survive restarts and synchronize after temporary disconnection without loss or duplication. Online notifications target delivery within one minute of their scheduled time; up to five minutes is acceptable if simpler to implement. With connectivity available, openings appear in shared history within one hour of occurrence, preserving their actual timestamps. Neither tolerance calls for deliberate delay. Failures are explained, never reported as success, and leave unaffected functions usable; unsynchronized history is marked as potentially outdated. |
| AC-NFR-004 | NFR-004 | Unauthorized schedule changes are rejected. Unapproved people or devices cannot retrieve personal data through the interface or direct service requests; knowing the public address grants no access; personal data uses encrypted transmission and encrypted shared storage; public repository files and application assets contain no private credentials or personal data. |
| AC-NFR-005 | NFR-005 | Medication output uses configured information and predefined wording. Incorrect, unclear, or off-topic input does not produce independently selected medications, doses, or generated medical advice. |

## Outstanding details

- Validate caregiver-entered familiar medication phrases and acceptable variants
  with the stakeholder. A clearly incorrect medication answer gets one retry
  before the configured answer is provided; this provisional rule is separate
  from the two-attempt unclear-recognition rule in AC-FR-006.
- Define offline notification acknowledgement and enforcement of audio/transcript deletion across offline devices and backups.
- One-time installation of the web app to the Home Screen is acceptable. Specific browser/OS versions remain undecided.
