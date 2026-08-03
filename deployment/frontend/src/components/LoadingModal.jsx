import React from 'react';
import { Loader2 } from 'lucide-react';
import { formatElapsed } from '../utils/formatters';

const LoadingModal = ({ isTranscribing, transcriptDataLength, currentStatusText, elapsedSeconds }) => {
  if (!isTranscribing || transcriptDataLength > 0) return null;

  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal">
        <Loader2 size={48} className="spinner modal-spinner" />
        <h3 className="modal-title">{currentStatusText}</h3>
        <p className="modal-message" style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--primary-light)' }}>
          Elapsed Time: {formatElapsed(elapsedSeconds)}
        </p>
      </div>
    </div>
  );
};

export default LoadingModal;
