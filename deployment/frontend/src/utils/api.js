const API_BASE_URL = 'http://localhost:8000';

const createTranscriptionRequest = (uploadOption, youtubeUrl, selectedFile, maxWords) => {
  if (uploadOption === 'youtube') {
    return fetch(`${API_BASE_URL}/api/transcribe/youtube`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: youtubeUrl, max_words: maxWords })
    });
  }

  const formData = new FormData();
  formData.append('file', selectedFile);
  formData.append('max_words', maxWords);

  return fetch(`${API_BASE_URL}/api/transcribe/file`, {
    method: 'POST',
    body: formData
  });
};

const handleStreamMessage = (data, callbacks) => {
  const { onChunk, onDone, onVideoReady, onStatusUpdate } = callbacks;

  if (data.status === 'chunk') {
    onChunk(data.data);
  } else if (data.status === 'done') {
    onDone(data.video_url);
    return true;
  } else if (data.status === 'video_ready') {
    onVideoReady(data.video_url);
  } else if (data.status === 'error') {
    throw new Error(data.message);
  } else {
    onStatusUpdate(data.status);
  }

  return false;
};

const readTranscriptionStream = async (response, callbacks) => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.trim()) continue;

      const data = JSON.parse(line);
      const isDone = handleStreamMessage(data, callbacks);
      if (isDone) return;
    }
  }
};

export const transcribeVideo = async (
  uploadOption,
  youtubeUrl,
  selectedFile,
  maxWords,
  callbacks
) => {
  try {
    const response = await createTranscriptionRequest(uploadOption, youtubeUrl, selectedFile, maxWords);

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    await readTranscriptionStream(response, callbacks);
  } catch (error) {
    console.error('Transcription error:', error);
    callbacks.onError(error);
  }
};
