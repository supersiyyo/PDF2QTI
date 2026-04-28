import React from 'react';
import { Cpu, Loader2, Download, ArrowLeft } from 'lucide-react';

const Shimmer = ({ style = {} }) => (
  <div className="sk-shimmer" style={style} />
);

const ProcessingState = ({ status, model }) => {
  const [factIndex, setFactIndex] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);

  const facts = [
    "Our system uses a model cascade to ensure 99.9% uptime.",
    "Gemini 2.5 Flash can process a 100-page PDF in seconds.",
    "We sanitize every string so your Canvas quiz never crashes.",
    "AI is currently solving questions to find the correct answer indices.",
    "QTI is the industry standard format for digital assessments.",
    "We strip newlines and special chars to keep your quiz clean.",
    "If the primary model is busy, we switch to a backup automatically.",
  ];

  React.useEffect(() => {
    const factInterval = setInterval(() => setFactIndex(p => (p + 1) % facts.length), 4000);
    const timeInterval = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => { clearInterval(factInterval); clearInterval(timeInterval); };
  }, []);

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div>
      {/* ── Status bar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        {/* left: model badge + timer */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#eff6ff', color: '#1d4ed8',
            padding: '4px 12px', borderRadius: '20px',
            fontSize: '0.75rem', fontWeight: 600, border: '1px solid #dbeafe'
          }}>
            <Cpu size={13} style={{ color: '#3b82f6' }} />
            <span>{model || 'System'}</span>
          </div>
          <span style={{
            fontFamily: 'monospace', fontSize: '0.8rem', color: '#94a3b8',
            background: '#f8fafc', padding: '2px 8px',
            borderRadius: '4px', border: '1px solid #e2e8f0'
          }}>{fmt(elapsed)}</span>
        </div>

        {/* right: spinner + status + rotating fact */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Loader2 size={15} style={{ color: '#3b82f6', animation: 'sk-spin 1s linear infinite', flexShrink: 0 }} />
          <div style={{ textAlign: 'right', width: '280px' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>
              {status || 'Processing…'}
            </div>
            <div
              key={factIndex}
              style={{
                fontSize: '0.7rem', color: '#94a3b8',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                animation: 'sk-fadein 0.4s ease'
              }}
            >
              {facts[factIndex]}
            </div>
          </div>
        </div>
      </div>

      {/* ── Skeleton that mirrors the real PreviewEditor layout ── */}
      <div>
        {/* Action bar row — mirrors "← Start Over" and "Download QTI .zip" */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
            <ArrowLeft size={16} />
            <Shimmer style={{ width: '70px', height: '14px', borderRadius: '4px' }} />
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#e2e8f0', padding: '8px 18px', borderRadius: '8px'
          }}>
            <Download size={15} style={{ color: '#94a3b8' }} />
            <Shimmer style={{ width: '110px', height: '14px', borderRadius: '4px' }} />
          </div>
        </div>

        {/* Main card — mirrors the surface-card with heading, quiz title, and questions */}
        <div className="surface-card">

          {/* "Preview & Edit Quiz" heading row with question-count badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem'
          }}>
            <Shimmer style={{ width: '170px', height: '22px', borderRadius: '4px' }} />
            <Shimmer style={{ width: '85px', height: '22px', borderRadius: '12px' }} />
          </div>

          {/* Quiz Title label + input */}
          <div style={{ marginBottom: '3rem' }}>
            <Shimmer style={{ width: '55px', height: '11px', borderRadius: '3px', marginBottom: '8px' }} />
            <Shimmer style={{ width: '50%', height: '40px', borderRadius: '4px' }} />
          </div>

          {/* 3 question blocks */}
          {[1, 2, 3].map(i => (
            <div key={i} className="question-block" style={{ marginBottom: '2rem' }}>
              {/* QUESTION X badge */}
              <div style={{ marginBottom: '12px' }}>
                <span style={{
                  background: 'var(--primary)', color: '#fff',
                  fontSize: '0.65rem', fontWeight: 700,
                  padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase'
                }}>Question {i}</span>
              </div>

              {/* Question text input (full-width) */}
              <Shimmer style={{ width: '100%', height: '36px', borderRadius: '4px', marginBottom: '16px' }} />

              {/* 4 choice rows — radio + full-width input + optional Correct badge */}
              {[1, 2, 3, 4].map(j => {
                const isCorrect = j === 2;
                return (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    {/* radio button */}
                    <div style={{
                      width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${isCorrect ? '#22c55e' : '#e2e8f0'}`,
                      background: isCorrect ? '#22c55e' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {isCorrect && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                    </div>
                    {/* choice text input */}
                    <Shimmer style={{
                      flex: 1, height: '34px', borderRadius: '4px',
                      ...(isCorrect ? {
                        background: 'linear-gradient(90deg,#dcfce7 0%,#bbf7d0 50%,#dcfce7 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'sk-shimmer 1.5s infinite'
                      } : {})
                    }} />
                    {/* Correct badge */}
                    {isCorrect && (
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, color: '#15803d',
                        background: '#dcfce7', padding: '2px 8px', borderRadius: '4px',
                        border: '1px solid #86efac', flexShrink: 0
                      }}>Correct</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .sk-shimmer {
          background: linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 50%, #e2e8f0 100%);
          background-size: 200% 100%;
          animation: sk-shimmer 1.5s infinite;
        }
        @keyframes sk-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes sk-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes sk-fadein {
          from { opacity: 0; transform: translateY(3px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ProcessingState;
