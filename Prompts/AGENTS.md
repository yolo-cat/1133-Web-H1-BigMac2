# Repository Guidelines for Codex

## Commit Messages
- Start each commit message with one of `docs:`, `feat:`, `fix:` or `chore:`.
- Keep messages concise and focused on a single change.

## Programmatic Checks
- After making changes, run `node --version` to confirm the Node.js environment.
- Do not run `npm start` or `node db.js` because the sqlite3 binary in this container is incompatible with the running Node version.

## Pull Requests
- Summarize major changes and cite relevant file lines in the PR description.
