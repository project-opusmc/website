# Opus Client Web — Agent Instructions

## Project

- This repository is the frontend for Opus Client. Do not rename the product.
- Stack: React 19, TypeScript, Vite, Astryx 0.7.11, neutral theme.
- Keep frontend work scoped to this repository. Do not modify sibling Opus repositories unless explicitly requested.
- Prefer clean, understated, professional UI with restrained styling and no gratuitous visual effects.
- Do not add code comments unless the user explicitly requests comments.

## Website brand direction

- The website has its own original design language. The client and launcher supply only product terminology, functional context, and broad motion/geometry concepts. Do not copy their layout, skins, surfaces, images as decoration, or existing screen hierarchy.
- Use the verified Opus mark for brand continuity. Approved client/launcher screenshots may appear only as clearly identified product previews, never as the visual design itself.
- Visual direction: editorial, understated, precise. No glow, neon, floating glass cards, colorful shadows, background blobs, or generic AI landing-page motifs.
- Use original editorial typography, warm paper/ink color, sparse architectural cuts and restrained geometric motion. Never reproduce the launcher hero video or the client composition. Honor prefers-reduced-motion.
- Keep names Opus Client, Opus Free, Aether and Elysium.
- Do not invent available downloads, prices, performance metrics, release dates, or successful checkouts.
- Product catalogue and paid tiers remain previews until payment, licensing and inventory are ready.
- User registration uses the local Node SQLite API, not client-side authentication.
- Custom semantic markup and project-owned CSS are intentionally used for art-directed sections. Use Astryx primitives for controls where appropriate, without replacing the approved art direction.
- Do not add code comments unless explicitly requested.

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

## Git branching policy — owner requirement

- The Opus superproject and all of its submodule repositories use a single working branch: `main`.
- Never create a second named branch, including feature, fix, Codex, Antigravity, temporary, checkpoint, or worktree branches. Do not run `git checkout -b`, `git switch -c`, `git branch <name>`, or `git worktree add -b`.
- Do not push any non-`main` branch or open a pull request that requires creating one.
- Work directly in the existing `main` worktree. Do not checkout/switch branches, reset, stash, rebase, cherry-pick, or discard unrelated changes just to start a task.
- Do not commit unrelated uncommitted files. Make commits and pushes only within the task's authorization.
- If an agent/runtime insists on creating a new branch, stop and report the constraint instead of creating it.
- Only a new explicit instruction from the project owner may override this policy.

## Canonical approved UI — website

- The current client entry renders `../ui-v2/src/approved/ClientSurface.tsx` and `IngameSurface.tsx` through `ProductApp.tsx`. The old `../ui-v2/src/hub/` folder is not the active design system.
- The current launcher entry renders `../launcher/desktop/src/ui/LauncherSurface.tsx`. Product screenshots are factual references only; do not copy the launcher art direction to the website.
- Source screenshots are generated headlessly with `npm run capture:ui`. Do not use remote desktop automation or assume previously copied screenshots remain current.
- Website design: `src/styles.css`. The standalone editorial identity deliberately differs from launcher and client UI. No glow, gradients as decoration, floating glass blocks, or generic AI visual patterns.
