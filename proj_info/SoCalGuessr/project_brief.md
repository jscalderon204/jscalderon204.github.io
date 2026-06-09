# SoCalGuessr — project brief

Strong, highly memorable **second** project. Subtitle/framing: *"Beating the Locals."* Its punchline is an excellent recruiter-skim hook — surface it prominently even though Qwen-4B leads on depth. A compact CNN for street-level geolocation in Southern California (UC San Diego course DSC 140B; backed by a written paper and reproducible training code).

## The work
- **Task:** from one Google Street View image, classify which of **six** SoCal cities it was taken in — Anaheim, Bakersfield, Los Angeles, Riverside, San Luis Obispo (SLO), San Diego. They share climate, vegetation, and road infrastructure, so they're genuinely easy to confuse.
- **Data:** 9,181 Street View images, near-balanced; seeded 80/20 split (seed 42) → 7,345 train / 1,836 val; downscaled to 64×32×3 (discards legible signage, so results read as a floor, not a ceiling).
- **Model:** small CNN — four conv blocks (16→32→32→64, 3×3 convs, batch-norm + ReLU), global average pool to a 64-vector, linear head to six logits. **33,510 parameters** — small by design.
- **Training:** Adam (lr 3e-4), cross-entropy on raw logits, batch 64, 80 epochs (~15 min on CPU), single seed (42). Checkpoint selection avoids cherry-picking — earliest epoch within 1% of best val accuracy → **epoch 45, 83.6%**.
- **Headline result:** **83.6% val accuracy** (1,534 / 1,836). Per-class recall: Riverside 94.0%, SLO 87.8%, San Diego 84.7%, Bakersfield 82.7%, Anaheim 75.6%, LA 75.2% (LA is a "confusion sink").
- **Punchline:** Joseph hand-labeled 50 images → **24%**; a roommate of 20 years in LA → **40%**; chance is **16.7%**. A 33k-param net trained in ~15 min **more than doubles a twenty-year local's accuracy.**
- **Honest limitations (include them):** 64×32 input throws away signage/fine texture; the single val split also guided checkpoint selection (headline likely slightly overstates truly-unseen performance); six cities in one region is a deliberately narrow slice.

## Source files (this directory)
`metrics.json` is **authoritative** (accuracy, per-class recall, confusion matrix); `history.json` is per-epoch (training-curve chart); also `model_info.json`, `train_run.log`, `socalguessr_train.py`, `socalguessr-paper.pdf`. Verify every published figure against these before shipping it.
