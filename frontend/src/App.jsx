import React, { useState } from 'react';
import axios from 'axios';
import UploadComponent from './components/UploadComponent';
import PreviewEditor from './components/PreviewEditor';
import ProcessingState from './components/ProcessingState';

function App() {
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRetryable, setIsRetryable] = useState(false);
  const [lastCall, setLastCall] = useState(null); // { file, mode }
  const [warning, setWarning] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [currentModel, setCurrentModel] = useState('');

  const handleProcessPdf = async (file, mode) => {
    setLoading(true);
    setError(null);
    setIsRetryable(false);
    setWarning(null);
    setCurrentStatus('');
    setCurrentModel('');
    setLastCall({ file, mode });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', mode);

      const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');
      
      const response = await fetch(`${baseURL}/api/process-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw { response: { status: response.status, data: errorData } };
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      let streamActive = true;
      while (streamActive) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop(); // Keep partial line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const payload = JSON.parse(line.replace('data: ', ''));
              
              if (payload.status === 'success') {
                setQuizData(payload.data);
                if (payload.data._warning) {
                  setWarning(payload.data._warning);
                }
                streamActive = false; // Break the outer loop
                break; // Break the lines loop
              } else if (payload.status === 'error') {
                setError(payload.message);
                streamActive = false;
                break;
              } else {
                const msg = typeof payload.message === 'object' ? payload.message.message : payload.message;
                setCurrentStatus(msg || '');
                if (payload.model) setCurrentModel(payload.model);
              }
            } catch (e) {
              console.error("Error parsing SSE chunk", e);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      const status = err.response?.status;
      const detail = err.response?.data?.detail;

      if (status === 503) {
        setIsRetryable(true);
        setError(detail || 'The AI model is currently overloaded. Please try again in a moment.');
      } else {
        setIsRetryable(false);
        setError(detail || 'An error occurred during processing.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastCall) {
      handleProcessPdf(lastCall.file, lastCall.mode);
    }
  };

  const handleExportQti = async (finalData) => {
    try {
      const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');
      const response = await axios.post(`${baseURL}/api/export-qti`, finalData, {
        responseType: 'blob'
      });
      
      // Trigger download
      const safe_filename = finalData.quiz_title
        ? finalData.quiz_title.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '')
        : 'quiz';
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${safe_filename}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export QTI. Please check console.");
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>PDF to Canvas QTI</h1>
        <p>Transform documents and static quizzes into Canvas-ready assessments.</p>
      </header>

      {warning && (
        <div className="surface-card" style={{ borderColor: '#10b981', backgroundColor: '#f0fdf4', marginBottom: '1rem' }}>
          <p style={{ color: '#064e3b', fontWeight: 500, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>✨</span> {warning}
          </p>
          <button
            onClick={() => setWarning(null)}
            style={{ marginTop: '6px', fontSize: '0.75rem', background: 'none', border: 'none', color: '#065f46', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
          >
            Dismiss Notice
          </button>
        </div>
      )}

      {error && (
        <div className="surface-card" style={{ borderColor: 'var(--error)' }}>
          <p style={{ color: 'var(--error)', fontWeight: 500, margin: 0 }}>{error}</p>
          {isRetryable && (
            <button
              id="retry-btn"
              onClick={handleRetry}
              style={{
                marginTop: '10px',
                padding: '6px 16px',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.875rem',
              }}
            >
              🔄 Retry
            </button>
          )}
        </div>
      )}

      {loading ? (
        <ProcessingState status={currentStatus} model={currentModel} />
      ) : !quizData ? (
        <UploadComponent onProcess={handleProcessPdf} />
      ) : (
        <div style={{ animation: 'fadeInResult 0.45s ease' }}>
          <PreviewEditor 
            initialData={quizData} 
            onExport={handleExportQti}
            onReset={() => { setQuizData(null); setWarning(null); }}
          />
        </div>
      )}

      <a 
        href="https://github.com/supersiyyo/PDF2QTI" 
        target="_blank" 
        rel="noopener noreferrer"
        className="github-link"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
        </svg>
        <span>View on GitHub</span>
      </a>
    </div>
  );
}

export default App;
