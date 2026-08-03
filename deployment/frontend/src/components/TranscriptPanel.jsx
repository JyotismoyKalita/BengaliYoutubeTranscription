import React from 'react';
import { Download, RotateCcw, Play } from 'lucide-react';

const TranscriptPanel = ({
  transcriptData,
  activeSegment,
  currentVideoTime,
  isTranscribing,
  canReset,
  handleSeek,
  downloadSrt,
  handleReset
}) => {
  const hasTranscript = transcriptData.length > 0;

  return (
    <div className="transcript-panel">
      <div className="transcript-header">
        <div className="transcript-title-row">
          <span className="transcript-title">TIMESTAMPED TRANSCRIPT</span>
        </div>
        
        <div className="search-filter-row" style={{ justifyContent: 'flex-start' }}>
          <button 
            className="btn-filter" 
            style={{ backgroundColor: 'var(--primary-blue)', color: 'white', border: 'none', opacity: hasTranscript ? 1 : 0.5 }}
            onClick={downloadSrt}
            disabled={!hasTranscript}
          >
            <Download size={14} /> Export .SRT
          </button>
          
          <button 
            className="btn-filter" 
            style={{ color: '#EF4444', borderColor: '#EF4444', opacity: canReset ? 1 : 0.5 }}
            onClick={handleReset}
            disabled={!canReset}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>
      
      <div className="transcript-list">
        {!hasTranscript && !isTranscribing ? (
           <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>
             No transcript yet. Enter a YouTube URL or upload a file to begin.
           </div>
        ) : null}

        {transcriptData.map(segment => {
          const isActive = currentVideoTime >= segment.rawStart && currentVideoTime <= segment.rawEnd;

          return (
            <div 
              key={segment.id} 
              className={`segment-card ${isActive ? 'active' : ''}`}
              onClick={() => handleSeek(segment)}
            >
              <div className="segment-header">
                <div className="timestamp">
                  {activeSegment === segment.id && <Play size={14} color="var(--primary-light)" fill="var(--primary-light)" />}
                  [{segment.time}]
                </div>
              </div>

              <div className="segment-text">
                "{segment.text}"
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TranscriptPanel;
