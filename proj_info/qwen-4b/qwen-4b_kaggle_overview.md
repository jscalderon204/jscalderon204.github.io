## **Overview**

This competition challenges participants to improve the mathematical reasoning capabilities of a small-sized language model \[Qwen3-4B\]; using only model-intrinsic methods such as prompt engineering, supervised fine-tuning, and reinforcement learning. Reliable mathematical reasoning unlocks the potential for LLMs to accelerate scientific discovery, automate complex quantitative analysis, and serve as accessible problem-solving tools across STEM disciplines. Your approaches will be evaluated on unified accuracy from high-school to graduate level math problems.

**Note: To enforce fairness, you are required to use Qwen/Qwen3-4B-Thinking-2507 model (can be trained with your proposed methods) for generating the final responses, no alternative models allowed.**

The evaluation combines multiple complementary benchmarks into a single unified accuracy metric. Problems span a range of mathematical domains, difficulty levels, and response formats, including both free-form and multiple-choice questions, to provide a comprehensive assessment of your model's reasoning capabilities.

Participants may use any model-intrinsic strategy to improve performance, including but not limited to:

1. **Prompt engineering** — chain-of-thought, few-shot exemplars, self-consistency, progressive-hint prompting, and other inference-time techniques  
2. **Supervised fine-tuning** — LoRA, QLoRA, or full fine-tuning on any publicly available training data  
3. **Reinforcement learning** — GRPO, DPO, outcome-based reward modeling, and related alignment methods

External model calls, API access, and tool-augmented generation (e.g., code interpreters or calculators) are **not permitted** at inference time. Success requires extracting the most mathematical reasoning capability possible from a single mid-sized model through careful optimization.

The dataset consists of mathematical reasoning problems spanning a range of mathematical domains and difficulty levels (high-school to graduate), and response formats. Each problem is provided in JSONL format, with one JSON object per line.

### **Question Formats**

**Free-form:** The model must produce one or more numerical or symbolic answers corresponding to the `[ANS]` placeholders in the question. A question may require a single answer or multiple answers.

**Multiple-choice:** The model must select the correct option from a provided list. The answer is a single capital letter corresponding to the correct choice.

### **Example Entries**

Free-form (single answer):

`{"question": "Here is an expression with negative exponents.\n$\\frac{1}{(-8)^{-3}}=$ [ANS]\nEvaluate the expression.", "answer": ["-512"], "id": 4}`

Free-form (multiple answers):

`{"question": "If $f(x)=4x^2+x+2$, find the following:\n(a) $f(3)=$ [ANS]\n(b) $f(-3)=$ [ANS]\n(c) $f(-2)=$ [ANS]", "answer": ["41", "35", "16"], "id": 2}`

Multiple-choice:

`{"question": "Given $u(x, y) = x^3 + 6x^2y - 3xy^2 - 2y^3$, find the analytic function $f(z) = u + iv$ ...", "options": ["$$( 6+4i ) z^{5}$$", "$$( 1-2i ) z^{3}$$", ...], "answer": "C", "id": 1}`

### **Data Splits**

* **Public set:** Problems with ground truth answers provided, intended for development and validation  
* **Private set:** Problems without answers, used for leaderboard evaluation and final ranking. The private test set follows a similar distribution to the public set in terms of difficulty, domains, and question formats

### **Notes**

* Answers in the test set are withheld. Your submission should contain predicted answers for all test problems.  
* For free-form questions with multiple `[ANS]` placeholders, all sub-answers must be correct for the question to be marked as correct.

