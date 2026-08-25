# How to Download and Compile Models for faster-whisper

In our pipeline, the baseline model (`large-v3`) is officially supported by the `faster-whisper` library and is downloaded automatically at runtime. 

However, the three specialized Bengali fine-tuned models used in this project are not natively available in the required CTranslate2 (`ct2`) format. We must manually download them from HuggingFace, fix their tokenizers, and compile them into `ct2` format.

Below are the exact instructions to compile all three fine-tuned models.

---

## 1. Mozilla AI (large-v3-bn)
This is the large-v3 model fine-tuned by Mozilla AI.

### Step 1: Download the Model
```python
from huggingface_hub import snapshot_download

snapshot_download(
    repo_id="mozilla-ai/whisper-large-v3-bn", 
    local_dir="./models/mozilla_large_source"
)
print("Download finished!")
```

### Step 2: Compile the Unified Tokenizer
Older Whisper repositories often lack a unified `tokenizer.json`. We generate it from legacy configs:
```python
from transformers import WhisperTokenizerFast

tokenizer = WhisperTokenizerFast.from_pretrained("./models/mozilla_large_source")
tokenizer.save_pretrained("./models/mozilla_large_source")
print("Unified tokenizer.json created successfully!")
```

### Step 3: Convert to CTranslate2 Format
```bash
ct2-transformers-converter --model ./models/mozilla_large_source \
    --output_dir ./models/whisper-large-v3-bn-ct2 \
    --copy_files preprocessor_config.json generation_config.json tokenizer.json tokenizer_config.json special_tokens_map.json added_tokens.json normalizer.json merges.txt vocab.json \
    --quantization float16
```

---

## 2. Tugstugi (Medium)
This is the BengaliAI competition winner.

### Step 1: Download the Model
```python
from huggingface_hub import snapshot_download

snapshot_download(
    repo_id="tugstugi/bengaliai-regional-asr_whisper-medium", 
    local_dir="./models/tugstugi_source"
)
print("Download finished!")
```

### Step 2: Compile the Unified Tokenizer
```python
from transformers import WhisperTokenizerFast

tokenizer = WhisperTokenizerFast.from_pretrained("./models/tugstugi_source")
tokenizer.save_pretrained("./models/tugstugi_source")
print("Unified tokenizer.json created successfully!")
```

### Step 3: Convert to CTranslate2 Format
```bash
ct2-transformers-converter --model ./models/tugstugi_source \
    --output_dir ./models/tugstugi_ct2_float16 \
    --copy_files preprocessor_config.json generation_config.json tokenizer.json tokenizer_config.json special_tokens_map.json added_tokens.json normalizer.json merges.txt vocab.json \
    --quantization float16
```

---

## 3. Bitwisemind-SAM (Medium - The Selected Final Model)
This is the DL Sprint 4.0 fine-tuned model by Bitwisemind.

### Step 1: Download the Model
```python
from huggingface_hub import snapshot_download

snapshot_download(
    repo_id="bitwisemind/sam_15000_clean_text_full_model", 
    local_dir="./models/bitwisemind_sam"
)
print("Download finished!")
```

### Step 2: Compile the Unified Tokenizer
```python
from transformers import WhisperTokenizerFast

tokenizer = WhisperTokenizerFast.from_pretrained("./models/bitwisemind_sam")
tokenizer.save_pretrained("./models/bitwisemind_sam")
print("Unified tokenizer.json created successfully!")
```

### Step 3: Convert to CTranslate2 Format
```bash
ct2-transformers-converter --model ./models/bitwisemind_sam \
    --output_dir ./models/bitwisemind_sam_ct2_float16 \
    --copy_files preprocessor_config.json generation_config.json tokenizer.json tokenizer_config.json special_tokens_map.json added_tokens.json normalizer.json merges.txt vocab.json \
    --quantization float16
```
