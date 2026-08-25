# 11. Deployment

With the `bitwisemind-sam` model selected and the pipeline optimized, the system is wrapped into a full-stack web application located in the `VideoTranscription` directory. This allows end-users to easily interact with the model via a modern UI.

### System Architecture

The application is split into a decoupled **FastAPI** backend and a **React/Vite** frontend.

#### 1. Backend (FastAPI)
The backend is responsible for all heavy lifting: downloading, audio extraction, and GPU-accelerated transcription.
- **Model Initialization**: On startup, the backend loads the `faster-whisper` CTranslate2 model into VRAM and runs a dummy audio file as a "warmup". This ensures the first actual user request doesn't suffer from initialization latency.
- **API Endpoints**: Exposes `/api/transcribe/youtube` (for URLs) and `/api/transcribe/file` (for direct uploads).
- **Asynchronous Processing**: Uses `asyncio` to run blocking I/O operations (`yt-dlp` and `ffmpeg`) without locking the main server thread.
- **Real-time Streaming**: Instead of waiting for the entire video to be transcribed, the backend yields data using FastAPI's `StreamingResponse` (via `application/x-ndjson`). As soon as a chunk of audio is transcribed, it is pushed to the client immediately.
- **Caching Mechanism**: Implements an in-memory hash cache. If a user requests a transcription for a video that was already processed, the backend instantly streams the cached text chunks instead of re-running the neural network.

#### 2. Frontend (React & Vite)
The frontend provides a clean, responsive user interface.
- Built with React and bundled via Vite for extremely fast hot-reloading and optimized production builds.
- Connects to the FastAPI backend and consumes the NDJSON stream, dynamically updating the transcription text on the screen in real-time as the backend processes the audio.

### Running the Application

To run the application locally for development:

**1. Start the Backend server:**
Navigate to the `VideoTranscription/backend` directory and run:
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
This will start the FastAPI server on `http://localhost:8000`.

**2. Start the Frontend dev server:**
Navigate to the `VideoTranscription/frontend` directory and run:
```bash
npm install
npm run dev
```
This will start the Vite dev server (typically on `http://localhost:5173`).
