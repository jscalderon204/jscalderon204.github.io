# Qwen-4B math reasoning — flagship project brief

The **flagship** project: most weight in the IA, most depth, leads the projects. *"Maximizing Math-Reasoning Accuracy in a 4B Thinking Model"* (UC San Diego, CSE 151B final project; solo).

Treat inference as an optimization problem: push a fixed, mandated **Qwen3-4B-Thinking-2507** as far as it goes with **prompting and decoding only — zero training** — on a single 12 GB GPU under a strict exact-match grader. The challenge (and the story) is squeezing maximum reasoning out of a constrained, fully self-hosted model.

## Headline (the recruiter fact)
**Leaderboard score 0.724** (best of two runs), up from a **0.388 baseline → +0.336, with zero training.** All gains from inference-time levers, not a bigger model.

## Results & method (authoritative — from the deck)
**Two metric scales — never conflate them.** *Dev accuracy* = % correct on an 80-question public dev set (a fast probe, reported as a percentage). *Leaderboard score* = the graded score on all 943 private questions (the official result, reported 0–1). The headline 0.724 is a leaderboard score.

- **Setup:** Qwen3-4B-Thinking-2507, official FP8 build via vLLM, on one RTX 4070 (12 GB, WSL2). No external data, tools, APIs, or calculators; all weights from HuggingFace. Dataset: HS→graduate math as JSONL — 1,126 public (dev) / 943 private (graded leaderboard); free-form (exact value per `[ANS]`) + multiple-choice; no augmentation or few-shot.
- **Four levers:** (1) two-phase thinking budget — cap reasoning tokens, then force a boxed answer; (2) FP8 over INT4 (~+1 pt, ~1.7× faster); (3) **grader-aligned prompt** (plain ASCII, exact precision, kept brackets) — the decisive lever; (4) light sampling at temperature 0.6 beat greedy.
- **Exp 1 — budget sweep [dev accuracy, 80-q dev set]:** 8,192/6,000 → 63.7%; **12,288/9,000 → 68.8% (optimum)**; 16,384/12,000 → 67.7%. Forced-to-answer error skew: MCQ 81% vs free-form 30% correct (formatting dominates).
- **Exp 2 — prompt engineering [leaderboard score, 943 private]:** Prompt G 0.696/0.703 (greedy / temp 0.6); **Prompt I 0.706/0.724**; prompt + temperature gains compound to +0.028.
- **Prompt variants [dev accuracy, 80-q dev set]:** base variant B 57.5%; variant F 70.0% (the lineage behind the leaderboard prompts above).
- **Key finding:** ~80% of free-form misses were formatting/truncation, not reasoning — so effort went to format-discipline and budget, not scale. **Supervised fine-tuning was tried and dropped** (collapsed dev accuracy 57.5% → 15%); the model was kept intact.
- **Limits / next:** ~5 hrs per full run on 12 GB; temp 0.6 trades exact reproducibility; 4B is a hard accuracy ceiling. Next: self-consistency voting, a trained answer-normalizer, scale-and-distill the two-phase budget into one pass.

## Source files (this directory)
- `qwen-4b_kaggle_overview.md` — competition framing.
- `qwen-4b-inference.py` — the **actual** pipeline (FP8 via vLLM, ~9k-token thinking budget, the winning grader-aligned free-form + MCQ system prompts). Present the prompt/serving engineering, not vague claims.
- `old_qwen-4b_slide_deck.pdf` — source of the numbers above. **Numbers are real and authoritative.**

## Hard rule: deck is content-only, never visual
Take only quantitative/qualitative content from the deck — **nothing** from its appearance (layout, color, typography, slide composition, charts-as-images, screenshots, diagrams). Rebuild every chart/figure natively in the site's own design language.
