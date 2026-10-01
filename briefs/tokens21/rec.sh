#!/bin/bash
# Record a demo with Claude Code's own session variables stripped, so the `claude` inside
# the take is a clean top-level session (not a child of the authoring session), running under
# the CLEAN config home seeded by seed-home.mjs (no private skills/connectors on camera).
cd "$(dirname "$0")/../.."
exec env -u CLAUDE_CODE_CHILD_SESSION -u CLAUDE_CODE_SESSION_ID -u CLAUDE_PID -u CLAUDE_EFFORT \
  -u CLAUDE_CODE_MESSAGING_SOCKET -u CLAUDECODE -u CLAUDE_CODE_SESSION_ATTENDED -u CLAUDE_CODE_ENTRYPOINT \
  -u CLAUDE_CODE_EXECPATH -u CLAUDE_CODE_MESSAGING_TOKEN \
  CLAUDE_CONFIG_DIR="${IAUTEUR_REC_ROOT:?set IAUTEUR_REC_ROOT to the recording workspace root}/_claude-home" node scripts/record.mjs "$@"
