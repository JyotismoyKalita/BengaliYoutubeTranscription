# 3. Faster-Whisper Architecture

Throughout this project, we prioritize the **faster-whisper** implementation of OpenAI's Whisper models over the standard HuggingFace/OpenAI versions. 

### Why faster-whisper?
1. **CTranslate2 Backend**: It utilizes the highly optimized CTranslate2 engine, which significantly reduces VRAM usage and speeds up inference times by up to 4x compared to the original implementation.
2. **Built-in VAD (Voice Activity Detection)**: Faster-whisper integrates Silero VAD. This allows us to filter out silence and non-speech segments *before* they are fed into the transformer, greatly reducing hallucinations.
3. **Batching Support**: Using `BatchedInferencePipeline`, we can process multiple chunks of audio simultaneously, maximizing GPU utilization.

**Note**: GPU execution requires the following NVIDIA libraries to be installed:

- cuBLAS for CUDA 12  
- cuDNN 9 for CUDA 12  

The latest versions of ctranslate2 only support CUDA 12 and cuDNN 9. Hence correct *.dll*s were imported manually in this project.

```python
import ctypes

for dll in [
    r"D:\Python\ytt\Lib\site-packages\nvidia\cublas\bin\cublas64_12.dll",
    r"D:\Python\ytt\Lib\site-packages\nvidia\cudnn\bin\cudnn64_9.dll",
]:
    ctypes.CDLL(dll)

print("CUDA DLLs loaded")
```
