import React from 'react';
import { Cpu, Sparkles, Loader2 } from 'lucide-react';

const ProcessingState = ({ status, model }) => {
  const [factIndex, setFactIndex] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);
  const [discoveryIndex, setDiscoveryIndex] = React.useState(0);
  
  const facts = [
    "Our system uses a model cascade to ensure 99.9% uptime.",
    "Gemini 2.5 Flash can process a 100-page PDF in seconds.",
    "We sanitize every string to ensure your Canvas quiz never crashes.",
    "AI is currently solving questions to find the correct answer indices.",
    "Did you know? QTI is the industry standard for digital assessments.",
    "We automatically remove line breaks to keep your quiz clean.",
    "Multiple models work in parallel to find the best extraction path."
  ];

  React.useEffect(() => {
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % facts.length);
    }, 4000);
    const timeInterval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    const discoveryInterval = setInterval(() => {
      setDiscoveryIndex((prev) => Math.min(prev + 1, 5));
    }, 3000);

    return () => {
      clearInterval(factInterval);
      clearInterval(timeInterval);
      clearInterval(discoveryInterval);
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="processing-container">
      <div className="status-header">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className="model-badge">
            <Cpu size={14} className="model-icon" />
            <span>{model || 'System'}</span>
          </div>
          <div className="timer-badge">
            {formatTime(elapsed)}
          </div>
        </div>
        <div className="status-indicator">
          <Loader2 size={16} className="spinner-icon" />
          <div className="status-stack">
            <span className="status-text">{status || 'Processing...'}</span>
            <span className="fact-text">{facts[factIndex]}</span>
          </div>
        </div>
      </div>

      <div className="skeleton-quiz">
        <div className="skeleton-quiz-header">
          <div className="skeleton-line shimmer" style={{ width: '120px', height: '24px', marginBottom: '8px' }}></div>
          <div className="skeleton-line shimmer" style={{ width: '100%', height: '40px' }}></div>
        </div>
        
        {[...Array(discoveryIndex + 1)].map((_, i) => (
          <div key={i} className="skeleton-question fade-in">
            <div className="question-label">Question {i + 1}</div>
            <div className="skeleton-line shimmer title"></div>
            <div className="skeleton-options">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="skeleton-option">
                  <div className="skeleton-circle shimmer"></div>
                  <div className="skeleton-line shimmer text"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .processing-container {
          padding: 20px 0;
        }
        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 16px;
        }
        .model-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #eff6ff;
          color: #1d4ed8;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid #dbeafe;
        }
        .timer-badge {
          font-family: monospace;
          font-size: 0.875rem;
          color: #64748b;
          background: #f8fafc;
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
        }
        .model-icon {
          color: #3b82f6;
        }
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #64748b;
          font-size: 0.875rem;
          text-align: right;
        }
        .status-stack {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .spinner-icon {
          animation: spin 1s linear infinite;
          color: #3b82f6;
        }
        .status-text {
          font-weight: 600;
          color: #1e293b;
        }
        .fact-text {
          font-size: 0.75rem;
          color: #64748b;
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .skeleton-quiz {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .skeleton-quiz-header {
          margin-bottom: 16px;
          padding-bottom: 24px;
          border-bottom: 1px solid #f1f5f9;
        }
        .skeleton-question {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 24px;
          position: relative;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
        }
        .question-label {
          display: inline-block;
          background: var(--primary);
          color: #fff;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .skeleton-line {
          height: 12px;
          background: #f1f5f9;
          border-radius: 4px;
        }
        .skeleton-line.title {
          width: 85%;
          height: 20px;
          margin-bottom: 24px;
        }
        .skeleton-line.text {
          width: 50%;
          height: 32px;
        }
        .skeleton-options {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-left: 8px;
        }
        .skeleton-option {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .skeleton-circle {
          width: 18px;
          height: 18px;
          background: #f1f5f9;
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          flex-shrink: 0;
        }

        .shimmer {
          background: linear-gradient(
            90deg,
            #e2e8f0 0%,
            #f1f5f9 50%,
            #e2e8f0 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProcessingState;
