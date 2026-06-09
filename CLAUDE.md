# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is (read first)

A **built and iterating** personal portfolio website for **Joseph Calderon**, a data scientist in San Diego. The site is implemented in **Astro (static)** and lives under `src/`. It has five pages: Home (`/`), three project deep dives (`/work/qwen-4b`, `/work/socalguessr`, `/work/sea-ice`), and About (`/about`).

The original brief (`BUILD_BRIEF.md`) mandated a plan-before-code workflow. **That process is complete**: three skill proposals were produced, synthesized by `huashu-design`, turned into an approved plan, and executed. **Do not re-run the proposal / synthesis / planning process.** Iterate on the existing site.

Reference docs:
- `PRODUCT.md`, strategic register doc (written for the `impeccable` skill). Register is **brand** (a portfolio: design IS the product).
- `~/.claude/plans/calm-mixing-dewdrop.md`, the approved implementation plan (historical).
- `BUILD_BRIEF.md`, the original brief (historical intent; it still frames the task as "produce a plan", which is now done).

Skills are vendored locally under `.claude/skills/` and `.agents/skills/` (huashu-design pinned in `skills-lock.json`).

## Non-negotiable content principle: measured truth only

**Every number and claim on the site must trace to a real source in this repo.** No invented metrics, no rounded-up guesses presented as fact. Distinguish measured from illustrative. This is a credibility requirement, not a style preference; the peer audience will check. When in doubt, pull the exact figure from the source files below rather than restating from memory. This is enforced in code: `src/components/Figure.astro` **throws at build time** if a `measured` figure has no `source`.

## Voice and copy rules (calibrated this project)

The site's prose is calibrated to the author's own writing sample (`author_info/author_writing_sample.md`): **measured, flowing, complete sentences** with reflective connective tissue, **low on contractions** (prefer "cannot", "does not", "I am"), drawn to the pleasure of a hard, constrained problem. Authority comes from clarity and substantiated claims, never buzzwords. It should read like a real, capable person wrote it.

**No em dashes anywhere on the site** (and no `--`). Use commas, colons, semicolons, periods, or parentheses. En dashes in numeric ranges (`2024–2027`, `0–1`, `85–89%`) are correct typography and are fine. When editing or adding copy, keep both rules.

Two audiences at once: fast-skimming recruiters (the value and proof must land in seconds, before any deep reading) and skeptical technical peers (rewarded with substantiated depth on a deep read). Quality bar: fast, responsive, works on phone and desktop, accessible (assistive-tech usable, legible, not color-dependent).

## Where the real content lives

Each area has a curated, readable **brief** file pointing at the authoritative raw data. Start there:
- `author_info/profile.md`, curated bio / education / experience / toolkit / contact (companion to binary `JCResume.docx`; raw notes in `About.md`; voice in `author_writing_sample.md`).
- `proj_info/qwen-4b/project_brief.md`, the **flagship** project (Qwen3-4B math-reasoning, CSE 151B). Headline **0.724** leaderboard score from a 0.388 baseline, zero training. Numbers trace to `old_qwen-4b_slide_deck.pdf` (real and authoritative, but **content-only: never reuse its visual design**). Two distinct metric scales that must stay separate and never share an axis: *dev accuracy* (%, 80-question dev set) versus *leaderboard score* (0 to 1, 943 private). Pipeline in `qwen-4b-inference.py`.
- `proj_info/SoCalGuessr/project_brief.md`, strong #2 (CNN geolocation, "beats the locals"). `metrics.json` is authoritative for accuracy / per-class / confusion; `history.json` for training curves; paper plus `socalguessr_train.py` for method.
- `proj_info/Vanishing_Arctic/project_brief.md`, #3, D3.js sea-ice scrollytelling. Craft and smoothness is the story; **no metrics, do not invent any.** `hero_logic.js`, `sea-ice-showcase.mp4` (copied to `public/assets/`).

## Build & tooling

**Stack: Astro (static)**, chosen for instant first paint (zero JS by default, the recruiter-first goal) and low single-maintainer upkeep. Charts render to static SVG/HTML at build time; the only client JS is the inlined Sea Ice scroll script on its own page (Home ships ~2.25 kB of prefetch JS only).

Commands:
- `npm install`, install deps.
- `npm run dev`, dev server at http://localhost:4321 (live reload).
- `npm run build`, static build to `dist/`.
- `npm run preview`, serve the built `dist/` (does not rebuild).
- `npm run check`, Astro/TS type-check (`astro check`). No unit-test runner yet.

There is no separate lint step; `astro check` is the type and diagnostics gate. Visual checks use a globally-available Playwright (`npx playwright screenshot ...`).

### Architecture
- `src/data/*.ts` is the **single source of truth for every number**. `socalguessr.ts` imports the authoritative `proj_info/SoCalGuessr/{metrics,history}.json` directly, so figures are read from source, not transcribed. `qwen.ts` transcribes deck figures with `source` tags. `projects.ts` and `site.ts` hold project metadata and site constants.
- `src/components/charts/*.astro` are hand-built (no charting library); each pairs a visual with a `<DataTable>` fallback and direct value labels (color is never the only channel).
- `src/components/{Figure,Stat,SourceTag,Callout}.astro` carry the measured-vs-illustrative token system and the provenance signature. `src/layouts/{BaseLayout,CaseLayout}.astro` are the page shell and the deep-dive spine.
- Design tokens (OKLCH cobalt = measured-data ink, amber reserved for human-stakes punchline deltas, type scale, spacing) live in `src/styles/global.css` on a light "instrument-white" surface.
- **Layout/rhythm note:** eyebrows (small uppercase tracked labels) are used sparingly and only when informative (the deep-dive narrative spine: "The problem", "The key finding", "Honest limitations"). Do **not** add an eyebrow above every section; that monotony was deliberately removed during a layout pass. Hierarchy comes from headings, spacing rhythm (tight groups, generous movements), and asymmetry (the flagship breaks wider).

### Open blockers (wired as nullable fields, never fabricated)
The real photo, GitHub URL, résumé PDF, live Sea Ice demo URL, and music-production assets are not yet provided. They are explicit nullable fields in `src/data/site.ts` (`github`, `resumePdf`, `photo`); wiring a real asset is a one-line edit and the markup falls back to an honest placeholder until then. The résumé PDF derives from `author_info/JCResume.docx`, goes in `public/`, and is set on `site.resumePdf`. Set `site` in `astro.config.mjs` to the real domain before deploy. Do not fabricate any of these.

### Repo hygiene
`.gitignore` excludes `.DS_Store`, `dist/`, `.astro/`, `node_modules/`. Git is initialized but there is no initial commit yet (commit when the user asks). The binary source assets (`JCResume.docx`, project PDFs/MP4, `proj_info/*` data) are authoritative content; keep them tracked, do not gitignore them.
