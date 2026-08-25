# 9. Final Model Selection

After extensive evaluation across diverse Bengali YouTube news clips (featuring varying background noise levels, different speaker accents, and complex vocabulary), we have definitively selected the **Bitwisemind-SAM** (`bitwisemind/sam_15000_clean_text_full_model`) model for our transcription pipeline.

### Why Bitwisemind-SAM?

1. **Superior Accuracy**: As demonstrated in the comparison table below, Bitwisemind-SAM consistently achieved the lowest Word Error Rate (WER) across every single video tested, mostly staying under the 20% mark.
2. **Robustness to Deletions**: Base models like `large-v3` dropped massive chunks of audio when faced with noisy YouTube conditions. Bitwisemind-SAM effectively mitigated these deletions.
3. **Optimized for Real-world Audio**: The DL Sprint 4.0 fine-tuning on 15,000 clean audio segments transformed the already strong `tugstugi` architecture into a production-ready model that rarely hallucinates or drops speech.

### Comprehensive Model Comparison

The table below aggregates the Word Error Rate (WER %) of every tested model against all 5 evaluation videos. Lower WER indicates better performance.

| Video | Video Length | Baseline (large-v3) | Mozilla AI (large-v3-bn) | Tugstugi | **Bitwisemind-SAM** |
|--|--|--|--|--|--|
| Rain | 1m 54s | 81.4% | 70.7% | 24.65% | **16.74%** |
| Delhi Protest | 2m 14s | 83.87% | 63.98% | 23.12% | **16.67%** |
| Subhendu CM | 4m 17s | 87.22% | 74.76% | 32.27% | **17.25%** |
| Dengue | 3m 3s | 86.54% | 70.05% | 31.59% | **14.84%** |
| Terrorist(Long) | 20m 3s | 83.46% | 69.57% | 31.58% | **19.63%** |
| Taslima Nasrin(Long) | 26m 19s | 78.28% | 61.91% | 30.11% | **18.99%** |
| Shamik(Long) | 20m 33s | 83.31% | 72.19% | 33.94% | **20.19%** |
| 10am News(Long) | 21m 26s | 86.77% | 70.56% | 32.74% | **20.64%** |

### Computational Efficiency (FLOPs Analysis)

To further validate our selection, we profiled the theoretical Floating Point Operations (FLOPs) required to process a standard 30-second audio chunk. Because compute cost is dictated strictly by model architecture (parameter count and tensor dimensions), models fine-tuned on the same base architecture share mathematically identical theoretical FLOPs.

The table below demonstrates that our selected Medium architecture not only achieves superior accuracy, but operates at roughly half the computational cost of the Large architecture, leading to vastly faster inference times and lower hardware requirements.

| Scenario / Metric | Whisper Large Architecture | Whisper Medium Architecture |
| :--- | :--- | :--- |
| **Associated Models** | `large-v3`, `mozilla-ai/large-v3-bn` | `tugstugi`, `bitwisemind-sam` |
| **Best Case (Silence - 1 token)** | 2.22 TFLOPS | 1.07 TFLOPS |
| **Average Case (Normal Speech - 150 tokens)** | 2.46 TFLOPS | 1.19 TFLOPS |
| **Worst Case (Hallucination - 448 tokens max)** | 2.94 TFLOPS | 1.43 TFLOPS |

*(Note: The Worst Case compute cost for the Medium architecture is significantly cheaper than the Best Case compute cost for the Large architecture.)*

### Conclusion

The data clearly supports our decision. While OpenAI's default `large-v3` models are incredibly powerful for high-resource languages, zero-shot Bengali transcription requires heavy, specialized fine-tuning. The **Bitwisemind-SAM** model, converted into our optimized CTranslate2 `faster-whisper` format, delivers the speed, accuracy, and acoustic robustness required to deploy a highly reliable Bengali transcription service.
