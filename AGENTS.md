# Opus Client Web — Agent Instructions

## Project

- This repository is the frontend for Opus Client. Do not rename the product.
- Stack: React 19, TypeScript, Vite, Astryx 0.7.11, neutral theme.
- Keep frontend work scoped to this repository. Do not modify sibling Opus repositories unless explicitly requested.
- Prefer clean, understated, professional UI with restrained styling and no gratuitous visual effects.
- Do not add code comments unless the user explicitly requests comments.

## Astryx usage

- Use `@astryxdesign/core` components and semantic tokens before creating custom equivalents.
- Inspect official component APIs with `npm run astryx:components`, `npx @astryxdesign/cli component <Name>`, and `npx @astryxdesign/cli search <query>` before using an unfamiliar component.
- Check templates with `npm run astryx:templates` and tokens with `npm run astryx:tokens`.
- Use the installed CLI's exact version and do not invent component names or props.
- Reuse `@astryxdesign/theme-neutral/built` through the provider in `src/main.tsx`.
- Keep the stylesheet import order: reset.css, astryx.css, then theme.css.
- Use CSS custom properties and semantic tokens for theme-aware custom styling. Do not introduce another UI library without user approval.

## Workflow

- Inspect existing files and project documentation before editing.
- Run `npm run typecheck` and `npm run build` after code changes when dependencies are available.
- Report any unrun validations; never claim success without execution.
- Do not operate the user's Mac GUI or mouse. Use permitted filesystem and terminal tools.

<!-- ASTRYX:START -->
Astryx v0.7.11 · 174 components
CLI: run every command as `npx astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in app entry e.g. main.tsx) — without these, components render unstyled:
  import "@astryxdesign/core/reset.css";
  import "@astryxdesign/core/astryx.css";

WORKFLOW — start every page from a template, never from scratch:
1. `astryx build "<idea>"` — names the template to scaffold from and the parts it lacks.
2. `astryx template <name> <path>` — scaffold it; keep its frame, gap and padding; replace the content.
3. `astryx template <Block>` for parts it lacks; `astryx component <Name>` to read props before using one.
Changing an existing page? Keep it: skip step 2 and add blocks/components inside its sections.
Before you deliver a build, run `astryx doctor --built <dir>`; don't deliver it if it fails.

RULES:
- No <div> — components handle all layout and spacing.
- Read `astryx docs layout` before changing a template's frame.
- Dense data = rows (Table, List/Item), not Card-wrapped lists. Badge = counts only.
- Style with component props first, then tokens (var(--color-*|--spacing-*|--radius-*)). No raw hex/px. No StyleX/Tailwind compiler here — don't use xstyle/utility classes directly. Some templates use StyleX and need a compiler plugin; see `astryx docs styling-overview`.
- Palettes and custom colors go through the theme, never :root overrides. Run `astryx theme add <slug>` to import; `theme eject <slug>` only forks source. See `astryx docs theme`.
- SELF-CHECK: re-read the file; replace any raw <div>/<span>, imported .css/@apply, or hardcoded #hex/px with the component or a token.

`astryx help` lists every command. Key ones beyond the workflow:
  search "<query>"   find any component / hook / doc / template
  discover <words>   integrations you could add
  docs <topic>       getting-started, principles, tokens, theme … (`astryx docs` lists all)
  docs cli           commands and API reference
  docs authoring     build an integration package, and every field it holds
  upgrade --from <old version> --apply   run after a dependency bump
<!-- ASTRYX:END -->
