import React from 'react';
import { Loader2 } from 'lucide-react';

const VideoPlayer = ({
  videoUrl,
  transcriptData,
  currentVideoTime,
  handleTimeUpdate,
  isTranscribing,
  uploadOption,
  playerRef
}) => {
  const currentSubtitle = transcriptData.find(
    (segment) => currentVideoTime >= segment.rawStart && currentVideoTime <= segment.rawEnd
  );
  const hasTranscriptWithoutVideo = transcriptData.length > 0 && !videoUrl;
  const placeholderText = uploadOption === 'youtube'
    ? 'Enter a YouTube URL to transcribe'
    : 'Select a file to load player';

  return (
    <div className="video-container" style={{ position: 'relative' }}>
      {videoUrl ? (
        <>
          <video 
            ref={playerRef}
            src={videoUrl}
            style={{ width: '100%', height: '100%', backgroundColor: 'black' }}
            controls
            onTimeUpdate={handleTimeUpdate}
          />
          {currentSubtitle && (
            <div className="subtitle-overlay">
              {currentSubtitle.text}
            </div>
          )}
        </>
      ) : (
        <div className="video-placeholder" style={{ flexDirection: 'column', textAlign: 'center', padding: '20px' }}>
          {hasTranscriptWithoutVideo ? (
            <div style={{ color: 'var(--text-muted)' }}>
              {isTranscribing ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Loader2 size={16} className="spinner" />
                  Transcribing...
                </div>
              ) : (
                <>
                  Transcription complete.<br/>
                  <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>(Video playback is only available for local file uploads)</span>
                </>
              )}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>
              {placeholderText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
