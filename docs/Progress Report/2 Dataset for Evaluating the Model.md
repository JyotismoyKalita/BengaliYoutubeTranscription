# 2. Dataset for Evaluating the Model

To ensure our evaluation accurately reflects real-world performance, we curated a diverse dataset of Bengali YouTube videos. We focused on news clips as they contain clear speech, but still present challenges like background noise and varying reporter accents.

### Chosen Videos

We selected eight specific videos (4 short, 4 long) and mapped them in `dataset/metadata.csv`:
- **Rain** (Short, ~2 mins)
- **Delhi Protest** (Short, ~2 mins)
- **Subhendu CM** (Short, ~4 mins)
- **Dengue** (Short, ~3 mins)
- **Terrorist(Long)** (Long, ~20 mins)
- **Taslima Nasrin(Long)** (Long, ~26 mins)
- **Shamik(Long)** (Long, ~20 mins)
- **10am News(Long)** (Long, ~21 mins)

### Audio Extraction via `yt-dlp` and `ffmpeg`

To process these videos uniformly, we utilized `yt-dlp` for downloading and `ffmpeg` for audio extraction. 
We strictly enforce a consistent audio format: **16 kHz, Mono, PCM 16-bit WAV**. This format is universally required by Whisper-based models for optimal processing.

```python
import subprocess
import yt_dlp

def download_and_extract_audio(url, output_stem):
    opts = {
        "format": "bestaudio/best",
        "outtmpl": output_stem,
        "postprocessors": [{"key": "FFmpegExtractAudio", "preferredcodec": "wav"}],
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        ydl.download([url])

    subprocess.run([
        "ffmpeg", "-i", f"{output_stem}.wav",
        "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", 
        f"{output_stem}_16k.wav"
    ], check=True)
```
