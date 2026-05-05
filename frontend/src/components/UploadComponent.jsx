import React, { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';

const UploadComponent = ({ onProcess }) => {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('digitize');
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
      onProcess(file, mode);
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
