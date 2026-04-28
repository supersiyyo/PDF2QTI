import React, { useEffect, useRef } from 'react';
import { Terminal, CheckCircle, AlertCircle, Loader2, Info } from 'lucide-react';

const ProgressConsole = ({ logs }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle size={14} className="text-success" />;
      case 'error': return <AlertCircle size={14} className="text-error" />;
      case 'warning': return <Info size={14} style={{ color: '#d97706' }} />;
      default: return <Loader2 size={14} className="animate-spin text-primary" />;
    }
  };

  return (
    <div className="surface-card progress-console">
      <div className="console-header">
        <Terminal size={16} />
        <span>Behind the Scenes</span>
      </div>
      <div className="console-body" ref={scrollRef}>
        {logs.length === 0 && <div className="console-line text-muted">Initializing stream...</div>}
        {logs.map((log, index) => (
          <div key={index} className={`console-line ${log.status}`}>
            <span className="console-timestamp">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
            <span className="console-icon">{getIcon(log.status)}</span>
            <span className="console-message">{log.message}</span>
          </div>
        ))}
      </div>
      <style jsx>{`
        .progress-console {
          background: #1e1e1e;
          color: #d4d4d4;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          padding: 0;
          overflow: hidden;
          border: 1px solid #333;
          margin-top: 20px;
        }
        .console-header {
          background: #333;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          color: #aaa;
          border-bottom: 1px solid #444;
        }
        .console-body {
          padding: 12px;
          max-height: 200px;
          overflow-y: auto;
          font-size: 0.8rem;
          line-height: 1.5;
        }
        .console-line {
          display: flex;
          gap: 8px;
          margin-bottom: 4px;
        }
        .console-timestamp {
          color: #6a9955;
          flex-shrink: 0;
        }
        .console-icon {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .console-message {
          word-break: break-all;
        }
        .error .console-message { color: #f44747; }
        .success .console-message { color: #4ec9b0; }
        .warning .console-message { color: #ce9178; }
        .info .console-message { color: #9cdcfe; }

        .text-success { color: #4ec9b0; }
        .text-error { color: #f44747; }
        .text-primary { color: #007acc; }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ProgressConsole;
