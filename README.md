# Opus Client Web

Standalone Git submodule for the Opus Client website, using React 19, Vite, TypeScript, and Meta's Astryx design system.

## Setup

Requires Node.js 22.13 or newer and npm.

```bash
cd ~/Projects/Opus/web
npm install
npm run astryx:init
npm run typecheck
npm run build
npm run dev
```

`npm run astryx:init` teaches coding agents the installed Astryx component catalog in `AGENTS.md` (and optionally other agent docs). All agents working in this folder must follow `AGENTS.md`.

## Astryx CLI

```bash
npm run astryx:components
npm run astryx:templates
npm run astryx:tokens
npm run astryx:manifest
npx @astryxdesign/cli component Button
```

## Agents

- Codex reads `AGENTS.md` at the project root.
- Antigravity uses `GEMINI.md` plus the shared `AGENTS.md`.
- ChatGPT via LocalMCP can read the same file when operating on this directory.

## References

- https://github.com/meta/astryx
- https://astryx.atmeta.com
