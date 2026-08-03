import asyncio
import hashlib
import json
import os
import struct
import uuid
import wave
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from audio_utils import download_video, extract_audio_from_video
from chunker import stream_chunks, stream_word_chunks
from transcriber import Transcriber


STATIC_DIR = "static"
SERVER_URL = "http://localhost:8000"
NDJSON_MEDIA_TYPE = "application/x-ndjson"
WARMUP_AUDIO = "warmup_dummy.wav"
UPLOAD_READ_SIZE = 1024 * 1024


transcriber = Transcriber()
transcription_cache = {}


def ndjson(payload: dict) -> str:
    return json.dumps(payload) + "\n"


def remove_if_exists(path: str) -> None:
    if os.path.exists(path):
        with suppress(OSError):
            os.remove(path)


def make_static_path(filename: str) -> str:
    return os.path.join(STATIC_DIR, filename)


def make_public_static_url(filename: str) -> str:
    return f"{SERVER_URL}/static/{filename}"


def create_warmup_audio(path: str = WARMUP_AUDIO) -> None:
    with wave.open(path, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(16000)
        wav_file.writeframes(struct.pack("<h", 0) * 16000)


def cache_key(kind: str, value: str) -> str:
    return f"{kind}:{value.strip()}"


def word_to_dict(word) -> dict:
    return {
        "word": word.word,
        "start": word.start,
        "end": word.end,
    }


def transcribe_words(audio_path: str) -> list[dict]:
    return [
        word_to_dict(word)
        for segment in transcriber.transcribe(audio_path)
        for word in segment.words
    ]


def get_cached_transcription(key: str):
    return transcription_cache.get(key)


def set_cached_transcription(key: str, words: list[dict], video_url: str | None = None) -> None:
    transcription_cache[key] = {
        "words": words,
        "video_url": video_url,
    }


async def stream_cached_chunks(words: list[dict], max_words: int):
    iterator = stream_word_chunks(iter(words), max_words=max_words)

    while True:
        chunk = await asyncio.to_thread(next, iterator, None)
        if chunk is None:
            break
        yield ndjson({"status": "chunk", "data": chunk})


async def save_upload(file: UploadFile, path: str) -> str:
    digest = hashlib.sha256()

    with open(path, "wb") as handle:
        while chunk := await file.read(UPLOAD_READ_SIZE):
            digest.update(chunk)
            handle.write(chunk)

    return digest.hexdigest()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up: Initializing Transcriber Model...")
    transcriber._initialize_model()
    print("Running warmup transcription...")
    create_warmup_audio()

    try:
        list(stream_chunks(transcriber.transcribe(WARMUP_AUDIO)))
    except Exception as e:
        print(f"Warmup failed (safe to ignore): {e}")
    finally:
        remove_if_exists(WARMUP_AUDIO)

    print("Startup complete. Ready to receive requests.")
    yield


app = FastAPI(title="VideoTranscribe API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name=STATIC_DIR)


class YouTubeRequest(BaseModel):
    url: str
    max_words: int = 20


@app.post("/api/transcribe/youtube")
async def transcribe_youtube(req: YouTubeRequest):
    async def generate():
        key = cache_key("youtube", req.url)
        cached = get_cached_transcription(key)

        if cached:
            video_url = cached["video_url"]
            yield ndjson({"status": "Using cached transcription..."})
            if video_url:
                yield ndjson({"status": "video_ready", "video_url": video_url})

            async for chunk in stream_cached_chunks(cached["words"], req.max_words):
                yield chunk

            yield ndjson({"status": "done", "video_url": video_url})
            return

        file_id = str(uuid.uuid4())
        video_filename = f"{file_id}.mp4"
        audio_filename = f"{file_id}.wav"

        local_path = make_static_path(video_filename)
        audio_path = make_static_path(audio_filename)
        public_video_url = make_public_static_url(video_filename)

        try:
            yield ndjson({"status": "Downloading YouTube Video..."})
            await asyncio.to_thread(download_video, req.url, local_path)
            yield ndjson({"status": "video_ready", "video_url": public_video_url})
            yield ndjson({"status": "Extracting Audio..."})
            await asyncio.to_thread(extract_audio_from_video, local_path, audio_path)
            yield ndjson({"status": "Transcribing Audio..."})

            words = await asyncio.to_thread(transcribe_words, audio_path)
            set_cached_transcription(key, words, public_video_url)

            async for chunk in stream_cached_chunks(words, req.max_words):
                yield chunk

            yield ndjson({"status": "done", "video_url": public_video_url})

        except Exception as e:
            print(f"Error during YouTube transcription: {e}")
            yield ndjson({"status": "error", "message": str(e)})
        finally:
            remove_if_exists(audio_path)

    return StreamingResponse(generate(), media_type=NDJSON_MEDIA_TYPE)


@app.post("/api/transcribe/file")
async def transcribe_file(file: UploadFile = File(...), max_words: int = Form(20)):
    async def generate():
        file_id = str(uuid.uuid4())
        _, ext = os.path.splitext(file.filename)
        if not ext:
            ext = ".mp4"

        local_path = f"temp_{file_id}{ext}"
        audio_path = f"temp_{file_id}.wav"

        try:
            yield ndjson({"status": "Saving Uploaded File..."})
            file_hash = await save_upload(file, local_path)
            key = cache_key("file", file_hash)
            cached = get_cached_transcription(key)

            if cached:
                yield ndjson({"status": "Using cached transcription..."})
                async for chunk in stream_cached_chunks(cached["words"], max_words):
                    yield chunk

                yield ndjson({"status": "done"})
                return

            yield ndjson({"status": "Extracting Audio..."})
            await asyncio.to_thread(extract_audio_from_video, local_path, audio_path)

            yield ndjson({"status": "Transcribing Audio..."})
            words = await asyncio.to_thread(transcribe_words, audio_path)
            set_cached_transcription(key, words)

            async for chunk in stream_cached_chunks(words, max_words):
                yield chunk

            yield ndjson({"status": "done"})

        except Exception as e:
            print(f"Error during file transcription: {e}")
            yield ndjson({"status": "error", "message": str(e)})
        finally:
            for path in [local_path, audio_path]:
                remove_if_exists(path)

    return StreamingResponse(generate(), media_type=NDJSON_MEDIA_TYPE)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
