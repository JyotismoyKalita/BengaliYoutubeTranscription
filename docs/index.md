# Timestamped Transcription of Bengali YouTube Videos

*This project was developed during an internship at EICT IIT Guwahati under the guidance of Prithvijit Guha Sir.*  

**[Read the Full Project Explanation Here](Progress_Report.md)** - Browse the comprehensive explanation of the project  

**[View Source Code on GitHub](https://github.com/JyotismoyKalita/BengaliYoutubeTranscription)** - Access the complete repository, scripts, and datasets.

## Project Demonstration


> **P.S. Additional notes not mentioned in the video:**
> - For each Bengali News YouTube video used for evaluation, their official `YouTube subtitles` were used as the Ground Truth.
> - For downloading YouTube videos directly within the pipeline, we utilized `yt-dlp`.
> - For extracting audio from downloaded YouTube videos or local video files, we utilized `ffmpeg`.

<div align="center">
  <iframe width="800" height="450" src="https://www.youtube.com/embed/GmkpxjahfRc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>

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
👉 **[Model_Guide.md](Model_Guide.md)**

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
