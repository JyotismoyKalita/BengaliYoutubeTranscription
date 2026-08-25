# 7. Tugstugi Model

The `tugstugi` model (`tugstugi/bengaliai-regional-asr_whisper-medium`) represents a paradigm shift in our evaluation. "Tugstugi" is a prominent contributor and Kaggle Grandmaster in the Bengali ASR community, well-known for providing high-quality models and won 1st Place in Bengali.AI's Speech Recognition competition hosted in Kaggle - [Bengali.AI Competition](https://www.kaggle.com/competitions/bengaliai-speech/writeups/chimege-1st-place-solution)

Unlike the generic large-v3 models, this model is built on the `medium` architecture but features a **custom 12k vocabulary tokenizer** specifically optimized for Bengali. Furthermore, it was heavily trained on diverse regional datasets including OpenSLR, Kathbath, and pseudo-labeled YouTube data. Because of this specialized architecture and training corpus, it is widely cited as the baseline foundation for state-of-the-art Bengali transcription.

### CTranslate2 Conversion

Because a `faster-whisper` compatible version of this model was not readily available, we compiled it into a CTranslate2 (ct2) format ourselves. This ensures we can leverage the speed, batching, and VAD capabilities of our pipeline. We used the following conversion command:

```bash
ct2-transformers-converter --model tugstugi/bengaliai-regional-asr_whisper-medium --output_dir models/tugstugi_ct2_float16 --copy_files preprocessor_config.json generation_config.json tokenizer.json tokenizer_config.json special_tokens_map.json added_tokens.json normalizer.json merges.txt vocab.json --quantization float16
```

### Evaluation Results

| Video | Video Length | Transcription Time | WER % | CER % | Word Accuracy % | GT Words | Pred Words | Correct Words | Substitutions | Deletions (Missed) | Insertions |
|--|--|--|--|--|--|--|--|--|--|--|--|
| Rain | 1m 54s | 3s | 24.65 | 11.94 | 75.81 | 215 | 203 | 163 | 39 | 13 | 1 |
| Delhi Protest | 2m 14s | 2s | 23.12 | 7.28 | 79.03 | 186 | 185 | 147 | 34 | 5 | 4 |
| Subhendu CM | 4m 17s | 5s | 32.27 | 15.63 | 69.97 | 626 | 587 | 438 | 135 | 53 | 14 |
| Dengue | 3m 3s | 4s | 31.59 | 11.87 | 70.88 | 364 | 367 | 258 | 100 | 6 | 9 |
| Terrorist(Long) | 20m 3s | 23s | 31.58 | 14.04 | 71.94 | 2527 | 2482 | 1818 | 575 | 134 | 89 |
| Taslima Nasrin(Long) | 26m 19s | 27s | 30.11 | 14.27 | 74.49 | 2670 | 2672 | 1989 | 560 | 121 | 123 |
| Shamik(Long) | 20m 33s | 25s | 33.94 | 13.27 | 70.1 | 2625 | 2660 | 1840 | 714 | 71 | 106 |
| 10am News(Long) | 21m 26s | 25s | 32.74 | 13.43 | 69.99 | 2456 | 2383 | 1719 | 597 | 140 | 67 |

**Analysis**: The `tugstugi` model demonstrates a massive leap forward. The Word Accuracy jumped from ~25% to **70-80%**, and deletions plummeted dramatically. The custom tokenizer and regional training data clearly paid off, as the model correctly transcribes the vast majority of the audio, though it still exhibits some word-level substitutions on highly complex vocabulary.
