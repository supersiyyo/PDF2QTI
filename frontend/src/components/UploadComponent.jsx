import React, { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';

const UploadComponent = ({ onProcess }) => {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('digitize');
  const [questionCount, setQuestionCount] = useState(10);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = () => {
    if (file) {
      onProcess(file, mode, questionCount);
    }
  };

  return (
    <div className="surface-card">
      <div 
        className={`dropzone ${file ? 'active' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <UploadCloud className="icon" />
        {file ? (
          <h3 style={{fontWeight: 600, color: 'var(--primary)'}}>{file.name}</h3>
        ) : (
          <>
            <h3 style={{fontWeight: 600, marginBottom: '0.5rem'}}>Click or drag PDF here to upload</h3>
            <p style={{color: 'var(--text-secondary)'}}>Standard format PDFs are highly recommended.</p>
          </>
        )}
        <input 
          type="file" 
          accept="application/pdf" 
          ref={fileInputRef} 
          style={{display: 'none'}} 
          onChange={handleFileChange} 
        />
      </div>

      <div className="mode-selector">
        <label className="mode-option">
          <input 
            type="radio" 
            name="mode" 
            value="digitize" 
            checked={mode === 'digitize'} 
            onChange={(e) => setMode(e.target.value)} 
            className="choice-radio"
          />
          Digitize Existing Quiz
        </label>
        <label className="mode-option">
          <input 
            type="radio" 
            name="mode" 
            value="generate" 
            checked={mode === 'generate'} 
            onChange={(e) => setMode(e.target.value)} 
            className="choice-radio"
          />
          Generate Multiple Choice
        </label>
      </div>

      {mode === 'generate' && (
        <div style={{ marginTop: '1.5rem', padding: '0 0.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Target Question Count
          </label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {[5, 10, 15, 20].map(val => (
              <button 
                key={val}
                onClick={() => setQuestionCount(val)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: questionCount === val ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: questionCount === val ? '#f0f4ff' : 'white',
                  color: questionCount === val ? 'var(--primary)' : 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {val}
              </button>
            ))}
            <div style={{ position: 'relative', flex: 1.5, minWidth: '80px' }}>
              <input 
                type="number"
                min="1"
                max="50"
                value={questionCount}
                onChange={(e) => setQuestionCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  outline: 'none',
                  textAlign: 'center'
                }}
              />
              <span style={{ position: 'absolute', top: '-18px', left: '0', fontSize: '0.65rem', color: '#94a3b8', fontWeight: 500 }}>Custom</span>
            </div>
          </div>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic' }}>
            The AI will generate up to {questionCount} questions based on your document.
          </p>
        </div>
      )}

      <button 
        className="btn-primary" 
        onClick={handleSubmit}
        disabled={!file}
        style={{ width: '100%', marginTop: '1.5rem' }}
      >
        Process Document
      </button>
    </div>
  );
};

export default UploadComponent;
