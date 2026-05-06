import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadComponent from '../../components/UploadComponent';
import ProcessingState from '../../components/ProcessingState';

function DailyByteGenerator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [currentModel, setCurrentModel] = useState('');
  const navigate = useNavigate();

  const handleProcessPdf = async (file) => {
    setLoading(true);
    setError(null);
    setCurrentStatus('');
    setCurrentModel('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');
      
      const response = await fetch(`${baseURL}/api/generate-daily-byte`, {
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
        buffer = lines.pop(); 

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const payload = JSON.parse(line.replace('data: ', ''));
              
              if (payload.status === 'success') {
                streamActive = false;
                navigate('/student/daily-byte/play', { state: { problems: payload.data.problems } });
                break;
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
      const detail = err.response?.data?.detail;
      setError(detail || 'An error occurred during processing.');
    } finally {
      setLoading(false);
    }
  };

  const dailyByteFacts = [
    "Analyzing your course material to extract key concepts.",
    "Formulating conceptual multiple-choice questions.",
    "Generating code tracing exercises for better comprehension.",
    "Creating matching sets for algorithmic complexities.",
    "Assembling your personalized Daily Byte session.",
  ];

  return (
    <div className="app-container">
      <header className="header">
        <h1>Generate Daily Byte</h1>
        <p>Upload a course document to generate an interactive practice session.</p>
      </header>

      {error && (
        <div className="surface-card" style={{ borderColor: 'var(--error)' }}>
          <p style={{ color: 'var(--error)', fontWeight: 500, margin: 0 }}>{error}</p>
        </div>
      )}

      {loading ? (
        <ProcessingState 
          status={currentStatus} 
          model={currentModel} 
          customFacts={dailyByteFacts}
          skeletonType="daily-byte"
        />
      ) : (
        <UploadComponent onProcess={handleProcessPdf} hideModes={true} />
      )}
    </div>
  );
}

export default DailyByteGenerator;
