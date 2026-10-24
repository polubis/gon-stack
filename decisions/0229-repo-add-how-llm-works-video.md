---
ticket: none
scope: repo
summary: Add "How an LLM works" explainer video via mp4-powerpoint
why: Dev wants EN step-by-step video of full LLM pipeline, no simplifications
date: 2026-10-24
tags: [video, linkedin, llm, mp4-powerpoint]
---

- Output `.evidences/how-llm-works.mp4` (gitignored); H.264 yuv420p, 1080x1350, 30 fps, 104.5s, no audio
- 15 slides: hook, pipeline, BPE tokens, embeddings + position, residual blocks, attention, causal mask, MLP, logits, temperature, sampling, generate loop, pretraining, post-training, CTA
  - Over skill's 6-9 slide default: dev asked for full process
- Proof = real nanoGPT code (model.py, train.py) on GPT-2 small config
  - Token IDs from `gpt-tokenizer` r50k_base; shapes, param count (124,439,808), tril, softmax numbers from local runs
  - Post-training rows from InstructGPT (arXiv 2203.02155); paper not fetchable in sandbox
