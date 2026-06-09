"""Run inference on the private test set and write the submission to results/submission.csv.
"""
import os
# Set up HF cache and flashinfer
os.environ.setdefault("HF_HOME", os.path.expanduser("~/.cache/huggingface"))
os.environ.setdefault("VLLM_USE_FLASHINFER_SAMPLER", "0")

import csv
import json
from pathlib import Path

# ─── Best configuration 
# Found that FP8 quantization was much faster on my GPU than INT4
DEFAULT_MODEL   = "Qwen/Qwen3-4B-Thinking-2507-FP8"   
DEFAULT_DATA    = "data/private.jsonl"                
DEFAULT_OUT     = "results/submission.csv"
MAX_TOKENS      = 12288
THINKING_BUDGET = 9000
TEMPERATURE     = 0.6
TOP_P, TOP_K    = 0.95, 20
GPU_MEM_UTIL    = 0.90

# ─── Winning prompt (Variant "I"), inlined verbatim 
# Free-form prompt: plain-ASCII output matched to judger.py, keep pair/interval parentheses, >=12 significant figures, and exact part-count.
SYSTEM_MATH = (
    "You are an expert mathematician. Solve the problem step-by-step. Before boxing, "
    "VERIFY your result: re-check the key steps and substitute the answer back in.\n"
    "Your answer is graded by an EXACT automated match against a reference value that is "
    "written in PLAIN ASCII math. Before you box, RE-READ the question and format the answer "
    "to match EXACTLY:\n"
    "1. PLAIN ASCII ONLY — never LaTeX. Use * for multiply, / for divide, ^ for powers, and "
    "sqrt(), exp(), log10(), ln(), sin(), cos(), pi, infinity. Do NOT use \\frac, \\dfrac, "
    "\\text, \\left, \\right, e^{...}, curly-brace exponents, or LaTeX spacing. "
    "Write 6*e^(16*x) (NOT 6e^{16x}); (-1)^(n+1)/n^4 (NOT \\dfrac{(-1)^{n+1}}{n^4}); "
    "sqrt(29) (NOT \\sqrt{29}); 20/(5+3*cos(t)) (NOT \\frac{20}{5+3\\cos t}).\n"
    "2. PRECISION: for a non-terminating decimal, copy AT LEAST 12 significant digits straight "
    "from your computation — do NOT round to 2–4 places even if it looks clean (write "
    "2.099595219784, NOT 2.10; 12.08140000, NOT 12.08). If the question states a precision, give "
    "exactly that. Prefer a high-precision DECIMAL over an unevaluated fraction/radical for a "
    "numeric answer, UNLESS the answer is inherently a formula/expression (a function of n, x, "
    "t, ...) or the question explicitly asks for exact/closed form.\n"
    "3. PAIRS/POINTS/INTERVALS/TUPLES: keep their parentheses AND the given order as ONE "
    "element — e.g. a point is (2, -2) (do NOT write -2, 2 or 2, -2 without parens); an "
    "interval is (-8, infinity); a closed interval is [3, 5].\n"
    "4. PARTS: answer EVERY [ANS] blank / asked quantity, in the exact order asked, separated "
    "by commas inside a SINGLE \\boxed{}, e.g. \\boxed{3, 7, 12}. RECOUNT the asked quantities "
    "before boxing — the number of comma-separated values must match exactly (no missing, no "
    "extra). Do NOT wrap the whole list of independent sub-answers in outer parentheses, but DO "
    "keep parentheses on any pair/interval that is itself one sub-answer.\n"
    "5. LABELS: output exactly the token(s) the question uses for categorical/letter answers "
    "(e.g. N not Nominal; yes/no exactly as written; concatenate a multi-letter selection like "
    "BCEG unless the question itself separates them).\n"
    "Put only the final answer(s) inside \\boxed{}."
    "\nFINAL CHECK before boxing: your \\boxed{} must contain EXACTLY one value per asked quantity and "
    "nothing else — no words, units, explanations, alternative forms, or extra values. Recount the "
    "[ANS] blanks / asked quantities and make the number of comma-separated values match that count exactly."
)
# MCQ prompt: derive the answer first, then eliminate options.
SYSTEM_MCQ = (
    "You are an expert mathematician. Read the problem and the answer choices.\n"
    "FIRST, work out the answer YOURSELF before reading the options — derive it independently.\n"
    "THEN test each option against your result: eliminate any option that contradicts your work; if your "
    "computed answer matches an option, select it; if none match, re-derive and recheck before choosing "
    "(do not force a guess until you have rechecked your work).\n"
    "Options may be labeled A through J. If the question asks to 'select all that apply' or for multiple "
    "correct options, output ALL correct letters concatenated with no separators (e.g. \\boxed{BCEG}); "
    "otherwise output the single best letter.\n"
    "Output ONLY the letter(s) inside exactly ONE \\boxed{}, with nothing else inside it, e.g. \\boxed{C}."
)

# Phase-2 force-close prompt when a question hits the thinking budget without closing </think>.
_FORCE_CLOSE = ("\n\nI have used my reasoning budget. Based on the work above, "
                "I will now state the final answer.\n</think>\n\n")



# Builds chat messages for one question. MCQ prompt iff the item has answer options
def _build_messages(item: dict) -> list:
    q = item["question"]
    opts = item.get("options")
    if opts:
        labels = [chr(65 + i) for i in range(len(opts))]
        user = q + "\n\nOptions:\n" + "\n".join(f"{l}. {o.strip()}" for l, o in zip(labels, opts))
        return [{"role": "system", "content": SYSTEM_MCQ}, {"role": "user", "content": user}]
    return [{"role": "system", "content": SYSTEM_MATH}, {"role": "user", "content": q}]


# Enforces a thinking-token budget through two-phase generation.
def _generate_two_phase(llm, prompts, budget, max_tokens, sampling_kwargs):
    """
    Phase 1: generate up to `budget` tokens, stopping early if the model closes </think>.
    Phase 2: feed phase-1 thinking back in (injecting a forced close if the budget was hit mid-thought), then generate the final answer with the remaining tokens.
    Returns full responses (thinking + </think> + answer)
    """
    from vllm import SamplingParams
    p1 = SamplingParams(max_tokens=budget, stop=["</think>"],
                        include_stop_str_in_output=False, **sampling_kwargs)
    out1 = llm.generate(prompts, p1)

    phase2_prompts, thinking_blocks, n_forced = [], [], 0
    for i, o in enumerate(out1):
        comp = o.outputs[0]
        thinking = comp.text

        # check if model closed on its own
        closed = (comp.stop_reason == "</think>")          
        closing = "</think>\n\n" if closed else _FORCE_CLOSE

        n_forced += (not closed)
        thinking_blocks.append(thinking + closing)
        phase2_prompts.append(prompts[i] + thinking + closing)
    print(f"  [two-phase] phase 1 done: {n_forced}/{len(prompts)} hit the budget and were forced to answer.")

    p2 = SamplingParams(max_tokens=max(256, max_tokens - budget), **sampling_kwargs)
    out2 = llm.generate(phase2_prompts, p2)
    return [(thinking_blocks[i] + out2[i].outputs[0].text).strip() for i in range(len(prompts))]




"""Full pipeline: load model -> build prompts -> two-phase generation -> write results/submission.csv. Returns the path to the written submission CSV
"""
def run_inference(
    data_path: str = DEFAULT_DATA,
    out_csv: str = DEFAULT_OUT,
    model: str = DEFAULT_MODEL,
    max_tokens: int = MAX_TOKENS,
    thinking_budget: int = THINKING_BUDGET,
    temperature: float = TEMPERATURE,
    gpu_memory_utilization: float = GPU_MEM_UTIL,
) -> str:
    
    from vllm import LLM
    from transformers import AutoTokenizer

    # 1 Load the private dataset
    data = [json.loads(l) for l in open(data_path, encoding="utf-8") if l.strip()]

    # 2 Build prompts (MCQ vs free-form chosen per item)
    tokenizer = AutoTokenizer.from_pretrained(model, trust_remote_code=True)
    prompts = [
        tokenizer.apply_chat_template(_build_messages(item), tokenize=False, add_generation_prompt=True)
        for item in data
    ]

    # 3 Size the KV-cache window from the longest prompt. Two-phase decoding feeds phase-1 thinking back in as phase-2's input, so window must cover prompt + max_tokens + close. VLLM crashes if not
    max_prompt_tokens = max(len(tokenizer(p).input_ids) for p in prompts)
    max_model_len = max(4096, max_prompt_tokens + max_tokens + 256)

    # 4 Load the model
    llm = LLM(
        model=model,
        gpu_memory_utilization=gpu_memory_utilization,
        max_model_len=max_model_len,
        trust_remote_code=True,
        enable_prefix_caching=True,
        max_num_seqs=64,
    )

    # 5 Two-phase thinking-budget generation
    sampling_kwargs = dict(temperature=temperature, top_p=TOP_P, top_k=TOP_K)
    responses = _generate_two_phase(llm, prompts, thinking_budget, max_tokens, sampling_kwargs)

    # 6 Write results/submission.csv. The grader extracts \\boxed{} from the full response
    pairs = sorted(zip(data, responses), key=lambda p: p[0]["id"])
    out_path = Path(out_csv)
    out_path.parent.mkdir(parents=True, exist_ok=True)   

    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(["id", "response"])
        for item, resp in pairs:
            writer.writerow([item["id"], resp])
    print(f"[run_inference] wrote to {out_path.resolve()}")
    return str(out_path)


if __name__ == "__main__":
    run_inference()
