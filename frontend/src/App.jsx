import React, { useState } from 'react';
import axios from 'axios';
import UploadComponent from './components/UploadComponent';
import PreviewEditor from './components/PreviewEditor';
import ProgressConsole from './components/ProgressConsole';

function App() {
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRetryable, setIsRetryable] = useState(false);
  const [lastCall, setLastCall] = useState(null); // { file, mode }
  const [warning, setWarning] = useState(null);
  const [logs, setLogs] = useState([]);

  const handleProcessPdf = async (file, mode) => {
    setLoading(true);
    setError(null);
    setIsRetryable(false);
    setWarning(null);
    setLogs([]);
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

      while (true) {
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
              } else if (payload.status === 'error') {
                setError(payload.message);
              } else {
                setLogs(prev => [...prev, payload]);
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
        <div className="surface-card" style={{ borderColor: '#d97706', backgroundColor: '#fffbeb' }}>
          <p style={{ color: '#92400e', fontWeight: 500, margin: 0 }}>
            ⚠️ {warning}
          </p>
          <button
            onClick={() => setWarning(null)}
            style={{ marginTop: '6px', fontSize: '0.75rem', background: 'none', border: 'none', color: '#92400e', cursor: 'pointer', padding: 0 }}
          >
            Dismiss
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
        <div className="surface-card loading-overlay">
          <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '30px', height: '30px', margin: '0 auto' }}></div>
          <span style={{ display: 'block', marginTop: '10px', textAlign: 'center' }}>Processing document... This may take a minute.</span>
          <ProgressConsole logs={logs} />
        </div>
      ) : !quizData ? (
        <UploadComponent onProcess={handleProcessPdf} />
      ) : (
        <PreviewEditor 
          initialData={quizData} 
          onExport={handleExportQti}
          onReset={() => { setQuizData(null); setWarning(null); }}
        />
      )}
    </div>
  );
}

export default App;
