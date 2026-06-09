/* Qwen-4B data. Numbers are transcribed from the project deck (the authoritative
   record) and project_brief.md. Source tags name where each figure comes from.
   TWO METRIC SCALES, never conflate them, and never share an axis:
     • dev accuracy   = % correct on the 80-question public dev set
     • leaderboard    = graded score 0–1 on all 943 private questions          */

export const headline = {
  baseline: 0.388,
  best: 0.724,
  delta: +(0.724 - 0.388).toFixed(3), // 0.336
  source: 'deck · project brief',
};

export const setup = {
  model: 'Qwen3-4B-Thinking-2507 (FP8)',
  gpu: 'one RTX 4070 · 12 GB · WSL2',
  privateQ: 943,
  devQ: 80,
  publicQ: 1126,
  serving: 'vLLM',
};

/* Exp 1: thinking-budget sweep. SCALE: dev accuracy (%), 80-q dev set. */
export const budgetSweep = {
  scale: 'dev accuracy · %',
  source: 'deck · Exp 1',
  unit: '%',
  points: [
    { label: '8,192 / 6,000', think: 6000, devAcc: 63.7, optimum: false },
    { label: '12,288 / 9,000', think: 9000, devAcc: 68.8, optimum: true },
    { label: '16,384 / 12,000', think: 12000, devAcc: 67.7, optimum: false },
  ],
};

/* Exp 2: prompt engineering. SCALE: leaderboard score (0–1), 943 private. */
export const promptProgression = {
  scale: 'leaderboard score · 0–1',
  source: 'deck · Exp 2',
  series: [
    { prompt: 'Prompt G', greedy: 0.696, temp06: 0.703 },
    { prompt: 'Prompt I', greedy: 0.706, temp06: 0.724 },
  ],
  note: 'Prompt + temperature gains compound to +0.028.',
};

/* The key finding: forced-to-answer error skew. SCALE: dev accuracy (%). */
export const forcedSkew = {
  scale: 'dev accuracy · %',
  source: 'deck · Exp 1',
  rows: [
    { kind: 'Multiple-choice', correctPct: 81 },
    { kind: 'Free-form', correctPct: 30 },
  ],
};

export const levers = [
  {
    n: 1,
    title: 'Two-phase thinking budget',
    body: 'The reasoning is capped at roughly 9,000 tokens, and if the model has not closed </think> by then, the remaining budget is spent forcing a boxed answer. This keeps a runaway chain of thought from getting truncated before it states a result.',
  },
  {
    n: 2,
    title: 'FP8 over INT4',
    body: 'On a 12 GB card the official FP8 build ran roughly 1.7× faster than INT4 and scored about a point higher, so it was a free win that came simply from choosing the right quantization.',
  },
  {
    n: 3,
    title: 'Grader-aligned prompt',
    body: 'This was the decisive lever. The prompt asks for plain-ASCII output, at least 12 significant figures, and brackets preserved for pairs and intervals, so the answer is formatted to match the exact-match grader rather than fighting it.',
    decisive: true,
  },
  {
    n: 4,
    title: 'Light sampling (temp 0.6)',
    body: 'Temperature 0.6, with top-p 0.95 and top-k 20, beat greedy decoding. The gain was small but consistent, and it compounded with the prompt work.',
  },
];

export const droppedSft = {
  before: 57.5,
  after: 15,
  scale: 'dev accuracy · %',
  source: 'deck',
};

export const limitations = [
  '~5 hours per full run on a single 12 GB card.',
  'Temperature 0.6 trades exact reproducibility for accuracy.',
  '4B parameters is a hard accuracy ceiling that no amount of prompting can clear.',
];

export const nextSteps = [
  'Self-consistency voting across samples.',
  'A trained answer-normalizer for the format-discipline failures.',
  'Distill the two-phase budget into a single pass.',
];

/* A real excerpt of the winning configuration + two-phase loop, from
   qwen-4b-inference.py, to show the engineering rather than just claim it. */
export const codeExcerpt = `# ── Best configuration (qwen-4b-inference.py) ──────────────────
DEFAULT_MODEL   = "Qwen/Qwen3-4B-Thinking-2507-FP8"   # FP8 > INT4 on 12 GB
MAX_TOKENS      = 12288
THINKING_BUDGET = 9000                                # two-phase budget cap
TEMPERATURE     = 0.6
TOP_P, TOP_K    = 0.95, 20

def _generate_two_phase(llm, prompts, budget, max_tokens, sampling_kwargs):
    # Phase 1: think up to \`budget\` tokens, stop early if </think> closes.
    p1 = SamplingParams(max_tokens=budget, stop=["</think>"], **sampling_kwargs)
    out1 = llm.generate(prompts, p1)

    phase2_prompts, n_forced = [], 0
    for i, o in enumerate(out1):
        thinking = o.outputs[0].text
        closed   = (o.outputs[0].stop_reason == "</think>")
        # If the budget was hit mid-thought, inject a forced close.
        closing  = "</think>\\n\\n" if closed else _FORCE_CLOSE
        n_forced += (not closed)
        phase2_prompts.append(prompts[i] + thinking + closing)

    # Phase 2: feed the thinking back in, generate the final boxed answer.
    p2 = SamplingParams(max_tokens=max(256, max_tokens - budget), **sampling_kwargs)
    out2 = llm.generate(phase2_prompts, p2)
    return [...]`;
export const codeSource = 'qwen-4b-inference.py';
