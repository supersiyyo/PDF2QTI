import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Copy, ExternalLink, Check, Info, Lock, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadComponent from '../../components/UploadComponent';
import PreviewEditor from '../../components/PreviewEditor';
import ProcessingState from '../../components/ProcessingState';
import VideoPlayer from '../../components/VideoPlayer';

function PDF2QTI() {
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRetryable, setIsRetryable] = useState(false);
  const [lastCall, setLastCall] = useState(null); // { file, mode }
  const [warning, setWarning] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [currentModel, setCurrentModel] = useState('');
  const [examLinks, setExamLinks] = useState(null); // { student, admin }
  const [copyStatus, setCopyStatus] = useState(null); // 'student' or 'admin'
  const playerRef = useRef(null);

  const scrollToGuide = () => {
    playerRef.current?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      playerRef.current?.openTheater();
    }, 800); // Wait for scroll to finish
  };

  const handleProcessPdf = async (file, mode, questionCount) => {
    setLoading(true);
    setError(null);
    setIsRetryable(false);
    setWarning(null);
    setCurrentStatus('');
    setCurrentModel('');
    setLastCall({ file, mode, questionCount });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', mode);
      formData.append('question_count', questionCount);

      const baseURL = (import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8000`).replace(/\/+$/, '');
      
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
      handleProcessPdf(lastCall.file, lastCall.mode, lastCall.questionCount);
    }
  };

  const handleExportQti = async (finalData) => {
    try {
      const baseURL = (import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8000`).replace(/\/+$/, '');
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

  const handleGenerateExam = async (finalData) => {
    setLoading(true);
    try {
      const baseURL = (import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8000`).replace(/\/+$/, '');
      const response = await axios.post(`${baseURL}/api/exams`, finalData);
      
      const { id, secret_id } = response.data;
      const origin = window.location.origin;
      
      const newLinks = {
        student: `${origin}/take/${id}`,
        admin: `${origin}/admin/${secret_id}`,
        title: finalData.quiz_title || 'Untitled Assessment',
        timestamp: new Date().toISOString()
      };
      
      setExamLinks(newLinks);
      
      // Persist to localStorage so instructor doesn't lose it
      const recent = JSON.parse(localStorage.getItem('recent_exams') || '[]');
      localStorage.setItem('recent_exams', JSON.stringify([newLinks, ...recent].slice(0, 5)));
      
    } catch (err) {
      console.error("Exam generation failed", err);
      alert("Failed to generate exam. Please check console.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-HTTPS local dev
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopyStatus(type);
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert("Failed to copy. Please select and copy manually.");
    }
  };
  return (
    <div className="app-container">
      <header className="header">
        <h1>PDF to Canvas QTI</h1>
        <p>Transform documents and static quizzes into Canvas-ready assessments.</p>
        
        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'center' }}>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={scrollToGuide}
            className="guide-trigger"
          >
            <div className="play-dot" />
            Watch Guide
          </motion.button>
        </div>
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
        <>
          <UploadComponent onProcess={handleProcessPdf} />
          
          {/* Recent Assessments Quick Access */}
          {localStorage.getItem('recent_exams') && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel"
              style={{ marginTop: '2rem', padding: '1.5rem' }}
            >
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={14} /> Recently Generated
              </h3>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                <strong>Local-Only Access:</strong> This history is stored <u>only on your device</u> (browser localStorage) and is never sent to our servers. Clearing your browser cache will erase this list.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(() => {
                  try {
                    const recent = JSON.parse(localStorage.getItem('recent_exams') || '[]');
                    if (!Array.isArray(recent)) return null;
                    return recent.map((exam, idx) => (
                      <div 
                        key={idx} 
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{exam.title}</div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(exam.timestamp).toLocaleString()}</div>
                        </div>
                        <button 
                          onClick={() => setExamLinks(exam)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        >
                          Retrieve Links
                        </button>
                      </div>
                    ));
                  } catch (e) {
                    return null;
                  }
                })()}
              </div>
            </motion.div>
          )}

          {/* Privacy & Compliance Disclosure */}
          <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', color: '#475569' }}>
              <Lock size={16} />
              <span style={{ fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Data Privacy & Compliance</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1rem 0' }}>
              <strong>Safe & Secure Generation:</strong> This application is configured to abide by strict data privacy standards. Your prompts and generated quiz content are <strong>not used for AI model training</strong>.
            </p>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '0.75rem' }}>
              <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', fontSize: '0.65rem', textTransform: 'uppercase' }}>Compliance Fact Sheet:</div>
              <ul style={{ margin: '0 0 12px 0', paddingLeft: '1.25rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><strong>No Training:</strong> Content is processed via a secure bridge and never contributes to foundational model improvement.</li>
                <li><strong>Ephemeral Storage:</strong> All assessment data and student records are automatically purged every 24 hours.</li>
                <li><strong>Device Sovereignty:</strong> Your generation history is stored locally on your device and never leaves this browser.</li>
              </ul>
              <a 
                href="https://ai.google.dev/gemini-api/terms#data-use-paid" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#475569', fontWeight: 700, textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ExternalLink size={12} /> Verify Compliance with Official Data Policy
              </a>
            </div>
          </div>
        </>
      ) : (
        <div style={{ animation: 'fadeInResult 0.45s ease' }}>
          <PreviewEditor 
            initialData={quizData} 
            onExport={handleExportQti}
            onGenerateExam={handleGenerateExam}
            onReset={() => { setQuizData(null); setWarning(null); setExamLinks(null); }}
          />
        </div>
      )}

      {/* Success Modal - Background click disabled to prevent accidental loss */}
      <AnimatePresence>
        {examLinks && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-content glass-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '600px', padding: '3.5rem' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <motion.div 
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                  style={{ width: '90px', height: '90px', backgroundColor: '#f0fdf4', color: '#10b981', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.1)' }}
                >
                  <Check size={44} strokeWidth={3} />
                </motion.div>
                <h2 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Live Assessment Ready</h2>
                <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '1rem' }}>Your secure student link and dashboard are ready.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Student Link */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Student Link (Public)</span>
                    <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: '#94a3b8' }}>HTTPS_TLS</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      readOnly 
                      value={examLinks.student} 
                      style={{ flex: 1, background: 'white', border: '1px solid var(--border)', padding: '10px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}
                    />
                    <button 
                      onClick={() => copyToClipboard(examLinks.student, 'student')}
                      className="btn btn-secondary"
                      style={{ padding: '0 12px', borderRadius: '8px' }}
                    >
                      {copyStatus === 'student' ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                {/* Admin Link */}
                <div style={{ background: '#fef2f2', padding: '1.25rem', borderRadius: '14px', border: '1px solid #fee2e2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Control (Secret)</span>
                    <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: '#fca5a5' }}>AES_256_HASH</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      readOnly 
                      type="password"
                      value={examLinks.admin} 
                      style={{ flex: 1, background: 'white', border: '1px solid #fee2e2', padding: '10px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#991b1b', fontFamily: 'monospace' }}
                    />
                    <button 
                      onClick={() => copyToClipboard(examLinks.admin, 'admin')}
                      className="btn btn-secondary"
                      style={{ padding: '0 12px', borderRadius: '8px', color: '#991b1b', borderColor: '#fee2e2' }}
                    >
                      {copyStatus === 'admin' ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', padding: '1.25rem', borderRadius: '14px', display: 'flex', gap: '12px', marginTop: '1.5rem' }}>
                <Info size={20} style={{ color: '#f97316', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '0.8rem', color: '#9a3412', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                  <strong>Data Hygiene Notice:</strong> This bridge is ephemeral. All records are automatically purged after 24 hours.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '2.5rem' }}>
                <button 
                  onClick={() => window.open(examLinks.admin, '_blank')}
                  className="btn btn-primary" 
                  style={{ flex: 1, margin: 0, padding: '1.15rem', borderRadius: '12px' }}
                >
                  Open Dashboard <ExternalLink size={18} style={{ marginLeft: '6px' }} />
                </button>
                <button 
                  onClick={() => setExamLinks(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '1.15rem', borderRadius: '12px' }}
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div style={{ marginTop: '4rem' }}>
        <VideoPlayer ref={playerRef} src="/videos/howtovideo.webm" />
      </div>

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

export default PDF2QTI;
