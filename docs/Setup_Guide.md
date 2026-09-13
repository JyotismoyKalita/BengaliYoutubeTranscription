# Developer Setup & Installation Guide

## Environment Setup

The project requires **Python 3.11**. Once your Python environment is ready, install the required dependencies:

```bash
python -m venv venv
.\venv\Scripts\Activate.ps1    # Windows (PowerShell)
pip install -r requirements.txt
```

---

## Dataset Preparation

To download the selected YouTube videos and extract the required 16kHz mono `.wav` audio files automatically, run the dataset downloader script:

```bash
.\venv\Scripts\Activate.ps1
python download_dataset.py
```

This will populate your `dataset/` directory according to the `dataset/metadata.csv` mapping.

---

## Model Compilation

This pipeline relies on heavily optimized `faster-whisper` (CTranslate2) formats for blazing-fast inference. While the baseline `large-v3` model downloads automatically, our specialized Bengali fine-tuned models must be compiled manually.

In our pipeline, the baseline model (`large-v3`) is officially supported by the `faster-whisper` library and is downloaded automatically at runtime. 

However, the three specialized Bengali fine-tuned models used in this project are not natively available in the required CTranslate2 (`ct2`) format. We must manually download them from HuggingFace, fix their tokenizers, and compile them into `ct2` format.

Below are the exact instructions to compile all three fine-tuned models.

---

### 1. Mozilla AI (large-v3-bn)
This is the large-v3 model fine-tuned by Mozilla AI.

#### Step 1: Download the Model
```python
from huggingface_hub import snapshot_download

snapshot_download(
    repo_id="mozilla-ai/whisper-large-v3-bn", 
    local_dir="./models/mozilla_large_source"
)
print("Download finished!")
```

#### Step 2: Compile the Unified Tokenizer
Older Whisper repositories often lack a unified `tokenizer.json`. We generate it from legacy configs:
```python
from transformers import WhisperTokenizerFast

tokenizer = WhisperTokenizerFast.from_pretrained("./models/mozilla_large_source")
tokenizer.save_pretrained("./models/mozilla_large_source")
print("Unified tokenizer.json created successfully!")
```

#### Step 3: Convert to CTranslate2 Format
```bash
ct2-transformers-converter --model ./models/mozilla_large_source \
    --output_dir ./models/whisper-large-v3-bn-ct2 \
    --copy_files preprocessor_config.json generation_config.json tokenizer.json tokenizer_config.json special_tokens_map.json added_tokens.json normalizer.json merges.txt vocab.json \
    --quantization float16
```

---

### 2. Tugstugi (Medium)
This is the BengaliAI competition winner.

#### Step 1: Download the Model
```python
from huggingface_hub import snapshot_download

snapshot_download(
    repo_id="tugstugi/bengaliai-regional-asr_whisper-medium", 
    local_dir="./models/tugstugi_source"
)
print("Download finished!")
```

#### Step 2: Compile the Unified Tokenizer
```python
from transformers import WhisperTokenizerFast

tokenizer = WhisperTokenizerFast.from_pretrained("./models/tugstugi_source")
tokenizer.save_pretrained("./models/tugstugi_source")
print("Unified tokenizer.json created successfully!")
```

#### Step 3: Convert to CTranslate2 Format
```bash
ct2-transformers-converter --model ./models/tugstugi_source \
    --output_dir ./models/tugstugi_ct2_float16 \
    --copy_files preprocessor_config.json generation_config.json tokenizer.json tokenizer_config.json special_tokens_map.json added_tokens.json normalizer.json merges.txt vocab.json \
    --quantization float16
```

---

### 3. Bitwisemind-SAM (Medium - The Selected Final Model)
This is the DL Sprint 4.0 fine-tuned model by Bitwisemind.

#### Step 1: Download the Model
```python
from huggingface_hub import snapshot_download

snapshot_download(
    repo_id="bitwisemind/sam_15000_clean_text_full_model", 
    local_dir="./models/bitwisemind_sam"
)
print("Download finished!")
```

#### Step 2: Compile the Unified Tokenizer
```python
from transformers import WhisperTokenizerFast

tokenizer = WhisperTokenizerFast.from_pretrained("./models/bitwisemind_sam")
tokenizer.save_pretrained("./models/bitwisemind_sam")
print("Unified tokenizer.json created successfully!")
```

#### Step 3: Convert to CTranslate2 Format
```bash
ct2-transformers-converter --model ./models/bitwisemind_sam \
    --output_dir ./models/bitwisemind_sam_ct2_float16 \
    --copy_files preprocessor_config.json generation_config.json tokenizer.json tokenizer_config.json special_tokens_map.json added_tokens.json normalizer.json merges.txt vocab.json \
    --quantization float16
```


---

## Running Experiments

The core evaluation logic and transcription pipeline are contained in the Jupyter Notebook:
**`experiment.ipynb`**

To run the experiments sequentially:

1. **Load DLLs:** Run the initial DLL loading cell (required for CTranslate2 on Windows).
2. **Load Helpers:** Run the transcription helper function cell to initialize the processing logic.
3. **Run Models:** Under each specific model section:
   * First, run the **Model Loading** cell to initialize the model in VRAM.
   * Then, run the **Transcription** cell to process the dataset.

*Note: All output transcriptions and evaluation metrics are saved to the `backup/bn1/Outputs` folder during experimental runs.*

---

## Web App Deployment

The project includes a real-time web application to stream transcription results. **Make sure to activate the necessary python enviromnent before running this**.

**Start the Backend (FastAPI)**
```bash
.\venv\Scripts\Activate.ps1
cd deployment/backend
python main.py
```

**Start the Frontend (React/Vite)**
```bash
cd deployment/frontend
npm install
npm run dev
```

---

## Project Structure

```text
├── dataset/                     # Contains video metadata and extracted audio
├── deployment/                  # Deployment source code (Backend/Frontend)
├── models/                      # Downloaded and compiled faster-whisper (ct2) models
├── Outputs/                     # Final transcribed outputs
├── download_dataset.py          # Script to download YouTube videos via yt-dlp
├── experiment.ipynb             # Main experimental model evaluation notebook
├── flops_analysis.ipynb         # GFLOPS calculation logic for model architectures
├── License                      # MIT License
├── Model_Guide.md               # Guide to download and compile ct2 version models
├── Progress_Report_Final.pdf    # Detailed Progress Report of the project
├── README.md                    # Readme file for the project
└── requirements.txt             # Python dependencies (requires Python 3.11)
```

## Author

[Jyotismoy Kalita](https://github.com/JyotismoyKalita)

## License

MIT License
