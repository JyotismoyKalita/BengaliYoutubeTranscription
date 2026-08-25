# 8. Bitwisemind-SAM Model

The `bitwisemind-sam` model (`bitwisemind/sam_15000_clean_text_full_model`) is a specialized, fine-tuned iteration built upon the successes of the tugstugi architecture. "BitwiseMind" is a research team from BUET that participated in the **DL Sprint 4.0** competition, which specifically focused on improving Bengali long-form speech recognition in noisy environments.

To achieve this, the team took the already-excellent `tugstugi` model and further fine-tuned it on a highly curated, custom dataset of approximately 15,000 clean, chunked Bengali audio segments. This research-grade fine-tuning specifically targeted the acoustic conditions, background noise, and speaker variability commonly found in real-world media (like our YouTube dataset). - [Bitwisemind Research Paper](https://arxiv.org/pdf/2605.08214)

### CTranslate2 Conversion

Because a `faster-whisper` compatible version of this model was not readily available, we compiled it into a CTranslate2 (ct2) format ourselves. This ensures we can leverage the speed, batching, and VAD capabilities of our pipeline. We used the following conversion command:

```bash
ct2-transformers-converter --model bitwisemind/sam_15000_clean_text_full_model --output_dir models/bitwisemind_sam_ct2_float16 --copy_files preprocessor_config.json generation_config.json tokenizer.json tokenizer_config.json special_tokens_map.json added_tokens.json normalizer.json merges.txt vocab.json --quantization float16
```

### Evaluation Results

| Video | Video Length | Transcription Time | WER % | CER % | Word Accuracy % | GT Words | Pred Words | Correct Words | Substitutions | Deletions (Missed) | Insertions |
|--|--|--|--|--|--|--|--|--|--|--|--|
| Rain | 1m 54s | 3s | 16.74 | 10.06 | 83.72 | 215 | 203 | 180 | 22 | 13 | 1 |
| Delhi Protest | 2m 14s | 2s | 16.67 | 4.91 | 86.02 | 186 | 184 | 160 | 19 | 7 | 5 |
| Subhendu CM | 4m 17s | 5s | 17.25 | 11.71 | 84.98 | 626 | 580 | 532 | 34 | 60 | 14 |
| Dengue | 3m 3s | 4s | 14.84 | 6.58 | 86.26 | 364 | 362 | 314 | 44 | 6 | 4 |
| Terrorist(Long) | 20m 3s | 23s | 19.63 | 9.58 | 83.18 | 2527 | 2477 | 2102 | 304 | 121 | 71 |
| Taslima Nasrin(Long) | 26m 19s | 25s | 18.99 | 11.97 | 83.48 | 2670 | 2517 | 2229 | 222 | 219 | 66 |
| Shamik(Long) | 20m 33s | 24s | 20.19 | 8.96 | 83.39 | 2625 | 2659 | 2189 | 376 | 60 | 94 |
| 10am News(Long) | 21m 26s | 25s | 20.64 | 9.9 | 82.04 | 2456 | 2405 | 2015 | 324 | 117 | 66 |

**Analysis**: `bitwisemind-sam` is the clear winner for our pipeline. Thanks to the DL Sprint 4.0 fine-tuning, it achieved the lowest WERs (consistently under 20% for most videos, hitting an impressive **14.84%** on the Dengue video) and the highest Word Accuracies. It successfully mitigates deletions while maintaining a very low substitution rate, proving that a competition-winning base model (`tugstugi`) further fine-tuned on curated long-form audio (`bitwisemind`) yields the ultimate production-ready Bengali transcription system.
