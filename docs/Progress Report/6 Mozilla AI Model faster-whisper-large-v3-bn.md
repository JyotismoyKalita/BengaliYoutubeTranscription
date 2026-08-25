# 6. Mozilla AI Model: faster-whisper-large-v3-bn

To improve upon the baseline, we tested the `mozilla-ai/faster-whisper-large-v3-bn` model. This is a fine-tuned version of OpenAI's Whisper large-v3 model, specifically targeted at Bengali (`bn`) by Mozilla.ai (available on HuggingFace as `mozilla-ai/whisper-large-v3-bn`). 

While this model benefits from targeted Bengali training data, community reports indicate that generalized fine-tunes still struggle with highly noisy, real-world audio like YouTube news broadcasts compared to models trained explicitly on competition-grade regional datasets.

### CTranslate2 Conversion

Because a `faster-whisper` compatible version of this model was not readily available, we compiled it into a CTranslate2 (ct2) format ourselves. This ensures we can leverage the speed, batching, and VAD capabilities of our pipeline. We used the following conversion command:

```bash
ct2-transformers-converter --model mozilla-ai/whisper-large-v3-bn --output_dir models/whisper-large-v3-bn-ct2 --copy_files preprocessor_config.json generation_config.json tokenizer.json tokenizer_config.json special_tokens_map.json added_tokens.json normalizer.json merges.txt vocab.json --quantization float16
```

### Evaluation Results

| Video | Video Length | Transcription Time | WER % | CER % | Word Accuracy % | GT Words | Pred Words | Correct Words | Substitutions | Deletions (Missed) | Insertions |
|--|--|--|--|--|--|--|--|--|--|--|--|
| Rain | 1m 54s | 5s | 70.7 | 60.75 | 29.77 | 215 | 89 | 64 | 24 | 127 | 1 |
| Delhi Protest | 2m 14s | 5s | 63.98 | 52.34 | 37.1 | 186 | 94 | 69 | 23 | 94 | 2 |
| Subhendu CM | 4m 17s | 9s | 74.76 | 66.82 | 25.56 | 626 | 233 | 160 | 71 | 395 | 2 |
| Dengue | 3m 3s | 7s | 70.05 | 57.35 | 31.04 | 364 | 178 | 113 | 61 | 190 | 4 |
| Terrorist(Long) | 20m 3s | 1m 11s | 69.57 | 58.17 | 31.14 | 2527 | 1164 | 787 | 359 | 1381 | 18 |
| Taslima Nasrin(Long) | 26m 19s | 1m 11s | 61.91 | 49.23 | 39.29 | 2670 | 1491 | 1049 | 410 | 1211 | 32 |
| Shamik(Long) | 20m 33s | 58s | 72.19 | 59.64 | 28.46 | 2625 | 1161 | 747 | 397 | 1481 | 17 |
| 10am News(Long) | 21m 26s | 1m 7s | 70.56 | 60.12 | 30.01 | 2456 | 1070 | 737 | 319 | 1400 | 14 |

**Analysis**: While this model showed some improvement over the baseline (reducing WER by ~10-20% on average), it still suffered from massive deletions. The model remains overly conservative and drops large segments of speech, indicating that while its vocabulary is better, its acoustic robustness for fast-paced, noisy YouTube audio is lacking.
