# Build a personal portfolio website for Joseph Calderon

> **Status (historical brief): this is DONE.** The plan-before-code process described
> below was completed, approved, and executed. The site is built in Astro under `src/`.
> This file is kept for original intent; for current state, stack, and rules, read
> `CLAUDE.md` first, then `PRODUCT.md`. Do not re-run the proposal/planning process.

Greenfield build of a portfolio site for **Joseph Calderon**, a San Diego data scientist open to data roles. No existing site to preserve. Every decision — IA, structure, stack, layout, visual design, interaction — is yours to make and justify from the purpose and content below, not from convention.

**First deliverable is a plan, not code** (see "Your task"). Read everything, including the referenced files, then plan.

## Purpose & success
The site's job: **land interviews and establish credibility**. Success = a recruiter forwards it and a skeptical peer trusts it. Two audiences at once:

1. **Hiring managers & technical recruiters (primary)** — skim fast, one tab among many, deciding in seconds. The value and proof of high-level work must land *before* any deep reading.
2. **Technical peers (DS/ML/research)** — go deep, judge rigor, methods, and the honesty of the numbers. The reward for a deep read, not the gate at the top.

Core challenge: **convince the fast skimmer that Joseph operates at a high level, and give the skeptical peer substantiated depth to confirm it** — without dumbing it down for either.

## Voice
Sharp, technical, confident, with a streak of playful, curiosity-driven inventiveness. Authority comes from clarity and substantiated claims, never buzzwords. It should feel like a real, capable person made it. Calibrate to `author_info/author_writing_sample.md`.

## Measured truth only (non-negotiable)
**Every number and claim must trace to a real source file in this repo.** No invented metrics, no rounded-up guesses as fact. Be explicit about measured vs. illustrative. Pull figures from the source files — never restate from memory. This honesty *is* the credibility, especially for peers.

## Content & source materials
All raw content lives in the repo; the files below are authoritative. The site must convey: who Joseph is and his value; his projects (each as a fast skim **and** an in-depth treatment); his background/experience (the ~1,000-student teaching footprint is a real differentiator); his toolkit; and a clear way to contact him. Organization is your call.

- **Who Joseph is** — `author_info/profile.md` (curated bio, education, experience, toolkit, contact; companion to `JCResume.docx`). Raw personal notes in `author_info/About.md`.
- **Projects** — see per-project briefs, which name the authoritative data files and the framing for each:
  - `proj_info/qwen-4b/project_brief.md`
  - `proj_info/SoCalGuessr/project_brief.md`
  - `proj_info/Vanishing_Arctic/project_brief.md`

## Project emphasis (ordering & prominence)
1. **Qwen-4B** (flagship) — most complex/robust; most depth; its strongest result is the recruiter headline. Generate a catchy title.
2. **SoCalGuessr** — strong, highly memorable; its "beats the locals" punchline is a prime skim hook.
3. **Sea Ice** — craft-forward, qualitative (no metrics). Feature is smooth, compelling scroll-based storytelling. Generate catchy title. 

Order and visual prominence should follow this ranking. Design the content model so adding more projects later stays clean and consistent.

## Quality bar
Fast and responsive; works on phone and desktop; accessible (assistive-tech usable, legible, not color-dependent). Substantiated content over decoration.

## Your task — process
Deliverable is a **robust, detailed plan**. Do **not** write site code until it's approved.

**Step 1 — Three parallel proposals.** Spawn three subagents in parallel, each invoking **exactly one** skill, each given this full brief, each returning a complete independent proposal and **building nothing**:
- `impeccable`
- `design-taste` (design-taste-frontend)
- `ui-ux-pro-max`

Each proposal covers, from its lens: strategy for the skim + depth goal, IA, how the projects and measured-truth content are presented, design direction, and technical approach.

**Step 2 — Synthesize, then plan.** You (main agent) invoke **`huashu-design`** as the **primary/lead design voice** to reconcile, critique, and elevate the three proposals into one coherent direction (huashu-design wins conflicts). Then produce the plan via plan mode (`/plan`), grounded in that synthesis. The plan must cover:

1. **Strategy** — winning the 4-second skim while rewarding the deep read.
2. **IA** — pages/sections/views and why; how projects are organized; how the skim and depth layers relate.
3. **Design direction** — the synthesized direction, and what was kept/dropped from each proposal, with reasons.
4. **Content plan** — how each project and the about/experience/contact material are structured and sequenced (Qwen-4B carries the most depth; SoCalGuessr's result is the strongest skim hook); how measured-truth is enforced.
5. **Technical approach** — stack and architecture, justified by the recruiter-first goal and single-maintainer upkeep. Don't over- or under-build.
6. **Build sequencing** — phases/milestones, highest-leverage first.
7. **Verification** — how you'll confirm it loads, is responsive, accessible, and content-accurate before calling it done.

**Clarifying questions.** Before finalizing, ask about genuine blockers. Open items: a real photo; a GitHub URL; a live Sea Ice demo link; music-production assets for the bio (Joseph wants suggestions on what to provide — see `author_info/About.md`); hosting/stack preferences. Present the plan for approval **before** writing any code.
