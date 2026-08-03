import os
import subprocess

import yt_dlp


AUDIO_FORMAT = ["-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1"]
VIDEO_FORMAT = "bestvideo[height<=360]+bestaudio/best"


def download_video(url: str, output_file: str) -> str:
    ydl_opts = {
        "format": VIDEO_FORMAT,
        "outtmpl": output_file,
        "merge_output_format": "mp4",
        "postprocessor_args": ["-c:a", "aac", "-b:a", "256k"],
        "quiet": True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
    return output_file


def extract_audio_from_video(video_path: str, output_file: str = "temp_audio.wav") -> str:
    if os.path.exists(output_file):
        os.remove(output_file)

    command = ["ffmpeg", "-i", video_path, *AUDIO_FORMAT, output_file]
    subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return output_file
