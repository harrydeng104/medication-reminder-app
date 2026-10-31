# Agent instructions

## Project documentation

- Read docs/requirements.md and docs/acceptance-criteria.md before
  changing product behavior.
- Keep product requirements in those documents rather than duplicating
  them here.
- Update relevant documentation when behavior or conventions change.

## Before editing

- Inspect relevant existing code, documentation, instructions, and
  working-tree changes.
- Follow established patterns where they exist.
- Keep changes focused on the task. Add dependencies or infrastructure
  only when there is a concrete need.

## Approval before code changes

- Before changing application code, configuration, dependencies, or development
  tooling, explain the proposed changes in chat and obtain explicit approval.
- Approval applies to the described scope; discuss and obtain approval for
  additional code changes outside that scope before making them.
- Read-only inspection is allowed without approval. Documentation changes may
  be made when requested or authorized by the conversation.
- Do not interpret a request to discuss or explain a step as approval to
  implement it.

## Respect existing work

- Preserve changes outside the task's scope.
- Do not discard user work or alter original assignment evidence unless
  the task explicitly authorizes it.
- Do not revert unrelated changes to resolve conflicts or simplify a task.

## Accuracy and evidence

- Do not fabricate facts, references, test results, or implementation status.
- Support material claims with repository references, observed tool output,
  or authoritative sources, as appropriate.
- Distinguish verified findings, assumptions, and proposals.
- State when something has not been checked.

## Application boundaries

- The application must not generate medical advice or independently
  select medications or determine doses.

## Verification

- Run checks appropriate to the change before reporting completion.
- Do not claim device compatibility based solely on desktop testing.
- Report failed checks, checks not run, and remaining limitations.

## Reporting changes

- Summarize what changed and why.
- Include clickable file references with line numbers for each changed file.
- Summarize verification performed and its outcome.

## Version control

- Keep credentials, private access links, real personal data, installed
  dependencies, and reproducible build output out of Git.
- Do not create commits unless requested.

## Development commands and architecture

- The app uses React, TypeScript, and Vite with application code in src/ and
  static public assets in public/. dist/ is generated production output.
- Install: npm install (npm ci for a clean install from package-lock.json).
- Develop: npm run dev. Build and type-check: npm run build.
- Lint: npm run lint (Oxlint). Preview a built app: npm run preview.
- Use npm.cmd on Windows if PowerShell blocks npm.ps1.
- Formatting and automated test commands have not been configured yet.
- Record architecture and file-location conventions as they are established.
- Do not invent commands or claim checks passed before running them.
