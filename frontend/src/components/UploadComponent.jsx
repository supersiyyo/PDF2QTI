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

      <div style={{ marginTop: '1.5rem', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Target Question Count</label>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>{questionCount} Questions</span>
        </div>
        <input 
          type="range" 
          min="1" 
          max="50" 
          value={questionCount} 
          onChange={(e) => setQuestionCount(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--primary)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>1</span>
          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>50</span>
        </div>
      </div>

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
