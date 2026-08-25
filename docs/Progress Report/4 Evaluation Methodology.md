# 4. Evaluation Methodology

To objectively evaluate the transcription quality, we use the industry-standard **JIWER** library.

### Metrics Computed
- **WER (Word Error Rate)**: Measures how many words were inserted, deleted, or substituted compared to the ground truth.
- **CER (Character Error Rate)**: Measures character-level errors. Particularly useful for Bengali to track minor spelling mistakes (matras, juktakkhors) that might artificially inflate WER.
- **Word Accuracy**: The percentage of words correctly predicted.

### Pre-processing for Bengali
Before computing metrics, we clean both the ground truth and predicted text by:
- Removing newlines and excess whitespace.
- Stripping punctuation, including the Bengali danda (`।`).

The metrics are calculated across all 5 test videos for each model to produce a comprehensive benchmark.
