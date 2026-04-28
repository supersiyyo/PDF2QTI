import React from 'react';
import { Cpu, Sparkles, Loader2 } from 'lucide-react';

const ProcessingState = ({ status, model }) => {
  return (
    <div className="processing-container">
      <div className="status-header">
        <div className="model-badge">
          <Cpu size={14} className="model-icon" />
          <span>{model || 'System'}</span>
        </div>
        <div className="status-indicator">
          <Loader2 size={16} className="spinner-icon" />
          <span className="status-text">{status || 'Processing...'}</span>
        </div>
      </div>

      <div className="skeleton-quiz">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-question">
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
          margin-bottom: 24px;
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
        .model-icon {
          color: #3b82f6;
        }
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 0.875rem;
        }
        .spinner-icon {
          animation: spin 1s linear infinite;
          color: #3b82f6;
        }
        .status-text {
          font-weight: 500;
        }

        .skeleton-quiz {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .skeleton-question {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 12px;
          padding: 20px;
        }
        .skeleton-line {
          height: 12px;
          background: #e2e8f0;
          border-radius: 6px;
        }
        .skeleton-line.title {
          width: 70%;
          margin-bottom: 20px;
        }
        .skeleton-line.text {
          width: 40%;
        }
        .skeleton-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .skeleton-option {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .skeleton-circle {
          width: 16px;
          height: 16px;
          background: #e2e8f0;
          border-radius: 50%;
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
