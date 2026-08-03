import ctypes
import sys


CUDA_DLLS = [
    r"D:\Python\ytt\Lib\site-packages\nvidia\cublas\bin\cublas64_12.dll",
    r"D:\Python\ytt\Lib\site-packages\nvidia\cudnn\bin\cudnn64_9.dll",
]
#MODEL_NAME = "large-v3"
MODEL_NAME = r"../../models/bitwisemind_sam_ct2_float16"
MODEL_OPTIONS = {"device": "cuda", "compute_type": "float16"}
TRANSCRIBE_OPTIONS = {
    "language":"bn",
    "batch_size":16,
    "vad_filter":True,
    "vad_parameters":{
        "min_silence_duration_ms": 4000,
        "speech_pad_ms": 5000
    },
    "word_timestamps":True
}


print(f"Running in Python Environment: {sys.executable}")


class Transcriber:
    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            # Lazily initialize to avoid double VRAM allocation in uvicorn parent/child processes
        return cls._instance

    def _load_cuda_dlls(self):
        print("Loading CUDA DLLs...")
        for dll in CUDA_DLLS:
            ctypes.CDLL(dll)
        print("CUDA DLLs loaded successfully.")

    def _initialize_model(self):
        if self._model is not None:
            return

        try:
            self._load_cuda_dlls()
        except Exception as e:
            print(f"Warning: Could not load CUDA DLLs. {e}")

        from faster_whisper import WhisperModel, BatchedInferencePipeline

        print(f"Loading {MODEL_NAME} model into VRAM...")
        base_model = WhisperModel(MODEL_NAME, **MODEL_OPTIONS)
        self._model = BatchedInferencePipeline(model=base_model)
        print("Batched model loaded successfully.")

    def transcribe(self, audio_path: str):
        """Transcribes the given audio file using batched inference."""
        if self._model is None:
            self._initialize_model()

        segments, _ = self._model.transcribe(audio_path, **TRANSCRIBE_OPTIONS)
        return segments
