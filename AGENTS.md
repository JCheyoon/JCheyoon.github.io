# AI Agent Instructions

Development conventions and work guidelines live in `CLAUDE.md` and the `.claude/` directory.

## General Guidelines

1. Always follow the guidelines in the root `CLAUDE.md` when working.
2. For multi-step workflows (verification, refactoring, deployment, etc.), load the skill specs defined in `.claude/skills/`.
3. Present a clear change plan before modifying code, then proceed.

Skills provide specialized instructions and workflows for specific tasks.
Use the skill tool to load a skill when a task matches its description.
