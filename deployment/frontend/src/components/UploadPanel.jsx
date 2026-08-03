import React from 'react';
import { CloudUpload, Video, Loader2 } from 'lucide-react';

const UploadPanel = ({
  uploadOption,
  setUploadOption,
  youtubeUrl,
  setYoutubeUrl,
  selectedFile,
  setSelectedFile,
  setVideoUrl,
  isTranscribing,
  handleTranscribe,
  canTranscribe,
  fileInputRef,
  maxWords,
  setMaxWords
}) => {
  const chooseFile = () => fileInputRef.current?.click();

  const selectFileOption = () => {
    setUploadOption('file');
    if (selectedFile) setVideoUrl(URL.createObjectURL(selectedFile));
  };

  const selectYoutubeOption = () => {
    setUploadOption('youtube');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) setVideoUrl(URL.createObjectURL(file));
    setUploadOption('file');
  };

  const handleMaxWordsChange = (e) => {
    setMaxWords(Number.parseInt(e.target.value, 10) || 20);
  };

  return (
    <div className="upload-panel">
      <div className="upload-panel-header">Start New Project</div>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        
        <div className="upload-options" style={{ flex: '2 1 0' }}>
          <div 
            className={`upload-card ${uploadOption === 'file' ? 'active' : ''}`}
            onClick={selectFileOption}
          >
            <div className="upload-card-title">
              <CloudUpload size={18} />
              Option 1: Upload a Video File
            </div>
            <input 
              type="file" 
              accept="video/*,audio/*"
              style={{ display: 'none' }} 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button 
              className="btn-light"
              onClick={(e) => {
                e.stopPropagation();
                chooseFile();
              }}
            >
              {selectedFile ? selectedFile.name : 'Choose File'}
            </button>
            <div className="upload-card-desc">(MP4, MOV, AVI, etc.)</div>
          </div>
          
          <div 
            className={`upload-card ${uploadOption === 'youtube' ? 'active' : ''}`}
            onClick={selectYoutubeOption}
          >
            <div className="upload-card-title">
              <Video size={18} />
              Option 2: Import from YouTube
            </div>
            <div className="upload-card-desc" style={{marginBottom: 0}}>Paste a direct video link</div>
            <input 
              type="text" 
              className="input-dark" 
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => {
                setYoutubeUrl(e.target.value);
                selectYoutubeOption();
              }}
              onClick={(e) => {
                e.stopPropagation();
                selectYoutubeOption();
              }}
            />
          </div>
        </div>
        
        <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Max Words per Segment:</label>
            <input 
              type="number"
              className="input-dark"
              value={maxWords}
              onChange={handleMaxWordsChange}
              min="1"
            />
          </div>

          <button 
            className="btn-primary" 
            onClick={handleTranscribe}
            disabled={isTranscribing || !canTranscribe}
            style={{ opacity: isTranscribing ? 0.7 : 1 }}
          >
            {isTranscribing ? 'Transcribing...' : 'Transcribe Video'}
            {isTranscribing && <Loader2 size={16} className="spinner" />}
          </button>
        </div>

      </div>
    </div>
  );
};

export default UploadPanel;
