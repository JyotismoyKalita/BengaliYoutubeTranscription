import os
import csv
import glob
import time
import subprocess
import yt_dlp
import re
import html
from pathlib import Path

def clean_subtitle_to_text(sub_file, text_file):
    try:
        with open(sub_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        content = re.sub(r'<[^>]+>', '', content)
        content = html.unescape(content)
        content = re.sub(r'\[.*?\]', '', content)
        content = re.sub(r'\(.*?\)', '', content)
        content = content.replace('>>', '')
        
        text_lines = []
        for line in content.split('\n'):
            line = line.strip()
            if not line: continue
            if 'WEBVTT' in line or '-->' in line or line.isdigit(): continue
            if line.startswith('Language:') or line.startswith('Kind:') or line.startswith('Style:'): continue
                
            if text_lines and text_lines[-1] == line:
                continue
                
            text_lines.append(line)
                
        with open(text_file, 'w', encoding='utf-8') as f:
            f.write("\n".join(text_lines))
            
        os.remove(sub_file)
        return True
    except Exception as e:
        print(f"     Failed to clean subtitle: {e}")
        return False

def extract_audio_from_video(video_path, output_file="audio.wav"):
    Path(output_file).unlink(missing_ok=True)
    subprocess.run(
        ["ffmpeg", "-i", video_path, "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", output_file],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return output_file

def download_media(links_file, dataset_dir):
    metadata_file = os.path.join(dataset_dir, 'metadata.csv')
    
    links = []
    with open(links_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                parts = line.split(': ', 1)
                if len(parts) == 2:
                    links.append((parts[0], parts[1]))
                    
    metadata = []
    
    for title, url in links:
        print(f"\nProcessing: {title} ({url})")
        safe_title = "".join([c for c in title if c.isalnum() or c in (' ', '-', '_')]).strip().replace(' ', '_')
        
        video_path = os.path.join(dataset_dir, f"{safe_title}_video.mp4")
        audio_path = os.path.join(dataset_dir, f"{safe_title}_audio.wav")
        text_path = os.path.join(dataset_dir, f"{safe_title}_subtitle.txt")
        
        # 1. Download Video with the absolute best video and audio available
        print("  -> Downloading Video...")
        ydl_opts_video = {
            'format': 'bestvideo[ext=mp4]+bestaudio/best',
            'outtmpl': video_path,
            'merge_output_format': 'mp4',
            'quiet': True,
            'no_warnings': True,
        }
        try:
            with yt_dlp.YoutubeDL(ydl_opts_video) as ydl:
                ydl.download([url])
                
            # 2. Extract Audio using the exact provided snippet
            if os.path.exists(video_path):
                print("  -> Extracting Audio (16kHz mono pcm_s16le)...")
                extract_audio_from_video(video_path, audio_path)
            else:
                print("     Video not found. Skipping audio extraction.")
                
        except Exception as e:
            print(f"     Failed to download video: {e}")

        # 3. Download Subtitles in Bengali
        print("  -> Downloading Bengali Subtitles...")
        ydl_opts_subs = {
            'skip_download': True,
            'writesubtitles': True,
            'writeautomaticsub': True,
            'subtitleslangs': ['bn', 'bn.*'], 
            'outtmpl': os.path.join(dataset_dir, f"{safe_title}_subtitle.%(ext)s"),
            'quiet': True,
            'no_warnings': True,
            'sleep_interval': 2,
            'max_sleep_interval': 5,
            'ignoreerrors': True,
        }
        try:
            with yt_dlp.YoutubeDL(ydl_opts_subs) as ydl:
                ydl.download([url])
        except Exception as e:
            print(f"     Failed to download subtitles: {e}")
            
        # 4. Clean Subtitles into plain text
        sub_files = glob.glob(os.path.join(dataset_dir, f"{safe_title}_subtitle.*"))
        sub_files = [f for f in sub_files if f.endswith('.vtt') or f.endswith('.srt')]
        
        final_subtitle_file = ""
        if sub_files:
            print("  -> Cleaning subtitles to plain text...")
            raw_sub = sub_files[0]
            if clean_subtitle_to_text(raw_sub, text_path):
                final_subtitle_file = os.path.basename(text_path)
            else:
                final_subtitle_file = os.path.basename(raw_sub)
        
        metadata.append({
            'Title': title,
            'URL': url,
            'Video_File': os.path.basename(video_path) if os.path.exists(video_path) else "",
            'Audio_File': os.path.basename(audio_path) if os.path.exists(audio_path) else "",
            'Subtitle_File': final_subtitle_file
        })
        
        time.sleep(2)

    print(f"\nWriting metadata to {metadata_file}...")
    if metadata:
        keys = ['Title', 'URL', 'Video_File', 'Audio_File', 'Subtitle_File']
        with open(metadata_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            writer.writerows(metadata)
        print("Done!")

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.abspath(__file__))
    links_txt_path = os.path.join(base_dir, 'dataset', 'Links.txt')
    dataset_folder = os.path.join(base_dir, 'dataset')
    
    if not os.path.exists(links_txt_path):
        print(f"Error: {links_txt_path} not found.")
    else:
        download_media(links_txt_path, dataset_folder)
