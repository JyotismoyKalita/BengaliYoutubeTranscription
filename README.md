# Timestamped Transcription of Bengali YouTube Videos

*This project was developed during an internship at EICT IIT Guwahati under the guidance of Prithvijit Guha Sir.*

This repository contains an end-to-end pipeline for downloading Bengali news clips from YouTube, extracting audio, running highly-optimized Automatic Speech Recognition (ASR) using `faster-whisper`, generating timestamped transcriptions, and serving them via a modern web interface.  

[Progress_Report_Final.pdf](/Progress_Report_Final.pdf) - contains the detailed progress report of the project.  
[Progress_Report_Notion](https://app.notion.com/p/Timestamped-Transcription-of-Bengali-YouTube-Videos-3af6dec2219380999e1fc52130a3e9f3) - Notion Link for the same progress report.

---

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

Follow the step-by-step instructions in the dedicated guide:
👉 **[Model_Guide.md](/Model_Guide.md)**

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

## Performance & Evaluation

### Final Model Selection (Word Error Rate %)
Bitwisemind-SAM was selected as our final production model due to its massive superiority in Bengali zero-shot transcription compared to standard Large models.

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
The Medium architecture (Bitwisemind-SAM) not only achieves vastly superior accuracy but operates at less than half the computational cost of the Large baseline models.

| Scenario / Metric | Whisper Large Architecture | Whisper Medium Architecture |
| :--- | :--- | :--- |
| **Associated Models** | `large-v3`, `mozilla-ai/large-v3-bn` | `tugstugi`, `bitwisemind-sam` |
| **Best Case (Silence - 1 token)** | 2.22 TFLOPS | 1.07 TFLOPS |
| **Average Case (Normal Speech - 150 tokens)** | 2.46 TFLOPS | 1.19 TFLOPS |
| **Worst Case (Hallucination - 448 tokens max)** | 2.94 TFLOPS | 1.43 TFLOPS |

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
