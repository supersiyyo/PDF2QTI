import React, { useState } from 'react';
import axios from 'axios';
import UploadComponent from './components/UploadComponent';
import PreviewEditor from './components/PreviewEditor';

function App() {
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleProcessPdf = async (file, mode) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', mode);

      const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');
      const response = await axios.post(`${baseURL}/api/process-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setQuizData(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "An error occurred during processing.");
    } finally {
      setLoading(false);
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

      {error && (
        <div className="surface-card" style={{borderColor: 'var(--error)'}}>
          <p style={{color: 'var(--error)', fontWeight: 500}}>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="surface-card loading-overlay">
          <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '30px', height: '30px' }}></div>
          <span>Processing document... This may take a minute.</span>
        </div>
      ) : !quizData ? (
        <UploadComponent onProcess={handleProcessPdf} />
      ) : (
        <PreviewEditor 
          initialData={quizData} 
          onExport={handleExportQti}
          onReset={() => setQuizData(null)}
        />
      )}
    </div>
  );
}

export default App;
