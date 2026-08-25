# 5. Baseline Model: faster-whisper-large-v3

Our first test was with the default OpenAI `large-v3` model. While `large-v3` is an incredibly capable multilingual model trained on millions of hours of audio, it is a generalist. It has not been specifically fine-tuned extensively enough on Bengali to capture the nuances of regional dialects and complex vocabulary.

As noted in various ASR research communities, zero-shot performance of base Whisper models on low-resource languages like Bengali often suffers from "hallucinations" and a tendency to drop (delete) large chunks of audio if the acoustic confidence drops below a certain threshold.

### Evaluation Results

| Video | Video Length | Transcription Time | WER % | CER % | Word Accuracy % | GT Words | Pred Words | Correct Words | Substitutions | Deletions (Missed) | Insertions |
|--|--|--|--|--|--|--|--|--|--|--|--|
| Rain | 1m 54s | 4s | 81.4 | 65.57 | 20.47 | 215 | 101 | 44 | 53 | 118 | 4 |
| Delhi Protest | 2m 14s | 4s | 83.87 | 62.55 | 17.74 | 186 | 98 | 33 | 62 | 91 | 3 |
| Subhendu CM | 4m 17s | 8s | 87.22 | 71.46 | 13.1 | 626 | 227 | 82 | 143 | 401 | 2 |
| Dengue | 3m 3s | 6s | 86.54 | 65.26 | 13.74 | 364 | 191 | 50 | 140 | 174 | 1 |
| Terrorist(Long) | 20m 3s | 49s | 83.46 | 64.16 | 17.49 | 2527 | 1153 | 442 | 687 | 1398 | 24 |
| Taslima Nasrin(Long) | 26m 19s | 1m 2s | 78.28 | 56.14 | 22.43 | 2670 | 1472 | 599 | 854 | 1217 | 19 |
| Shamik(Long) | 20m 33s | 56s | 83.31 | 63.13 | 17.56 | 2625 | 1200 | 461 | 716 | 1448 | 23 |
| 10am News(Long) | 21m 26s | 57s | 86.77 | 66.44 | 14.21 | 2456 | 1025 | 349 | 652 | 1455 | 24 |

**Analysis**: The baseline `large-v3` performed extremely poorly on the Bengali dataset. With WERs consistently exceeding 80%, the model exhibited a massive amount of deletions (missed words) and substitutions. It essentially failed to produce cohesive Bengali sentences, validating the consensus that base Whisper requires fine-tuning for this language.
