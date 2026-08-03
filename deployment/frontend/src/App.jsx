import React, { useState, useRef, useEffect } from 'react';
import './index.css';

// Components
import Navbar from './components/Navbar';
import UploadPanel from './components/UploadPanel';
import VideoPlayer from './components/VideoPlayer';
import TranscriptPanel from './components/TranscriptPanel';
import LoadingModal from './components/LoadingModal';

// Utils
import { formatTime, formatSrtTime } from './utils/formatters';
import { transcribeVideo } from './utils/api';

const DEFAULT_MAX_WORDS = 20;
const INITIAL_STATUS = 'Connecting to server...';
const TRANSCRIBING_STATUS = 'Transcribing Audio...';

const createTranscriptSegment = (chunk, id) => ({
  id,
  rawStart: chunk.start,
  rawEnd: chunk.end,
  time: `${formatTime(chunk.start)} - ${formatTime(chunk.end)}`,
  text: chunk.text.trim()
});

const buildSrt = (segments) => (
  segments
    .map((segment, index) => (
      `${index + 1}\n` +
      `${formatSrtTime(segment.rawStart)} --> ${formatSrtTime(segment.rawEnd)}\n` +
      `${segment.text}`
    ))
    .join('\n\n') + '\n\n'
);

const downloadTextFile = (content, filename) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

function App() {
  const [activeSegment, setActiveSegment] = useState(null);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);

  const [transcriptData, setTranscriptData] = useState([]);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const [uploadOption, setUploadOption] = useState('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [maxWords, setMaxWords] = useState(DEFAULT_MAX_WORDS);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentStatusText, setCurrentStatusText] = useState(INITIAL_STATUS);

  const playerRef = useRef(null);
  const fileInputRef = useRef(null);
  const canTranscribe = uploadOption === 'youtube' ? Boolean(youtubeUrl) : Boolean(selectedFile);
  const canReset = transcriptData.length > 0 || Boolean(videoUrl || youtubeUrl || selectedFile);

  useEffect(() => {
    let interval;

    if (isTranscribing) {
      setElapsedSeconds(0);
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTranscribing]);

  const handleTranscribe = async () => {
    if (!canTranscribe) return;

    setIsTranscribing(true);
    setTranscriptData([]);
    setCurrentStatusText(INITIAL_STATUS);

    if (uploadOption === 'youtube') {
      setVideoUrl('');
    }

    await transcribeVideo(uploadOption, youtubeUrl, selectedFile, maxWords, {
      onChunk: (chunk) => {
        setTranscriptData((prev) => [...prev, createTranscriptSegment(chunk, prev.length)]);
      },
      onDone: (url) => {
        if (url && uploadOption === 'youtube') setVideoUrl(url);
        setCurrentStatusText('Transcription Complete!');
      },
      onVideoReady: (url) => {
        if (url && uploadOption === 'youtube') setVideoUrl(url);
      },
      onStatusUpdate: (status) => {
        if (status === TRANSCRIBING_STATUS) setElapsedSeconds(0);
        setCurrentStatusText(status);
      },
      onError: () => {
        alert('Transcription failed. Is the FastAPI backend running on port 8000?');
      }
    });

    setIsTranscribing(false);
  };

  const handleReset = () => {
    setTranscriptData([]);
    setVideoUrl('');
    setYoutubeUrl('');
    setSelectedFile(null);
    setActiveSegment(null);
    setCurrentVideoTime(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadSrt = () => {
    if (transcriptData.length === 0) return;

    downloadTextFile(buildSrt(transcriptData), 'transcript.srt');
  };

  const handleSeek = (segment) => {
    setActiveSegment(segment.id);
    if (playerRef.current) {
      playerRef.current.currentTime = segment.rawStart;
      playerRef.current.play().catch((e) => console.error('Play failed:', e));
    }
  };

  const handleTimeUpdate = (e) => {
    setCurrentVideoTime(e.target.currentTime);
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <div className="left-col">
          <UploadPanel
            uploadOption={uploadOption}
            setUploadOption={setUploadOption}
            youtubeUrl={youtubeUrl}
            setYoutubeUrl={setYoutubeUrl}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            setVideoUrl={setVideoUrl}
            isTranscribing={isTranscribing}
            handleTranscribe={handleTranscribe}
            canTranscribe={canTranscribe}
            fileInputRef={fileInputRef}
            maxWords={maxWords}
            setMaxWords={setMaxWords}
          />

          <VideoPlayer
            videoUrl={videoUrl}
            transcriptData={transcriptData}
            currentVideoTime={currentVideoTime}
            handleTimeUpdate={handleTimeUpdate}
            isTranscribing={isTranscribing}
            uploadOption={uploadOption}
            playerRef={playerRef}
          />
        </div>

        <TranscriptPanel
          transcriptData={transcriptData}
          activeSegment={activeSegment}
          currentVideoTime={currentVideoTime}
          isTranscribing={isTranscribing}
          canReset={canReset}
          handleSeek={handleSeek}
          downloadSrt={downloadSrt}
          handleReset={handleReset}
        />
      </main>

      <LoadingModal
        isTranscribing={isTranscribing}
        transcriptDataLength={transcriptData.length}
        currentStatusText={currentStatusText}
        elapsedSeconds={elapsedSeconds}
      />
    </div>
  );
}

export default App;
