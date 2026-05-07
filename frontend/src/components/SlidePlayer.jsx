import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2, X } from 'lucide-react';

const SLIDE_DURATION = 4000; // ms per slide
const TICK_MS = 50;

/* ── Shared slide image with crossfade ───────────────────── */
function SlideImage({ baseUrl, index, fileExtension }) {
  const [imgError, setImgError] = useState(false);
  const imageNumber = index + 1; // 1-based indexing for images
  const imageSrc = `${baseUrl}/${imageNumber}${fileExtension}`;

  // Reset error state when slide changes
  useEffect(() => { setImgError(false); }, [index, baseUrl]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={index}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        style={{ position: 'absolute', inset: 0 }}
      >
        {!imgError ? (
          <img
            src={imageSrc}
            alt={`Slide ${imageNumber}`}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(208,13,45,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.75rem',
            }}>🎬</div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
              {imageNumber}{fileExtension}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textAlign: 'center', padding: '0 2rem' }}>
              Missing image: <br />
              <code style={{ color: 'rgba(107,109,255,0.8)' }}>{baseUrl}/{imageNumber}{fileExtension}</code>
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Dot navigation ──────────────────────────────────────── */
function DotNav({ current, total, onGo, size = 'sm' }) {
  const dotSize = size === 'sm' ? 7 : 9;
  const activeDotW = size === 'sm' ? 18 : 24;
  return (
    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onGo(i)}
          title={`Step ${i + 1}`}
          style={{
            width: i === current ? activeDotW : dotSize,
            height: dotSize,
            borderRadius: '999px',
            background: i === current
              ? 'linear-gradient(90deg, var(--primary), var(--secondary))'
              : 'var(--border)',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      ))}
    </div>
  );
}

/* ── Progress bar ────────────────────────────────────────── */
function ProgressBar({ progress, height = 4 }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height, background: 'rgba(255,255,255,0.15)',
    }}>
      <div style={{
        height: '100%',
        width: `${Math.min(progress * 100, 100)}%`,
        background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
        transition: `width ${TICK_MS}ms linear`,
      }} />
    </div>
  );
}

/* ── Icon button helper style ────────────────────────────── */
const iconBtn = {
  background: 'none',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.4rem',
  transition: 'all 0.2s',
};

/* ══════════════════════════════════════════════════════════
   Main SlidePlayer Component
══════════════════════════════════════════════════════════ */
export default function SlidePlayer({ baseUrl, slideCount, fileExtension = '.png' }) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTheater, setIsTheater] = useState(false);
  const audioRef = useRef(null);
  const audioStarted = useRef(false);

  /* ── Preload Strategy ── */
  useEffect(() => {
    // Prime the browser cache by loading all images in the background
    for (let i = 1; i <= slideCount; i++) {
      const img = new Image();
      img.src = `${baseUrl}/${i}${fileExtension}`;
    }
  }, [baseUrl, slideCount, fileExtension]);

  /* ── Auto-advance timer ── */
  useEffect(() => {
    if (!isPlaying) return;
    setProgress(0);
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / SLIDE_DURATION, 1);
      setProgress(p);
      if (elapsed >= SLIDE_DURATION) {
        clearInterval(timer);
        setCurrent(prev => (prev + 1) % slideCount);
      }
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [isPlaying, current, slideCount]);

  /* ── Keyboard handler (theater only) ── */
  useEffect(() => {
    if (!isTheater) return;
    const handler = (e) => {
      if (e.key === 'ArrowRight') setCurrent(p => (p + 1) % slideCount);
      else if (e.key === 'ArrowLeft') setCurrent(p => (p - 1 + slideCount) % slideCount);
      else if (e.key === 'Escape') closeTheater();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isTheater, slideCount]);

  /* ── Audio helpers ── */
  const startAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.volume = 0.35;
    audioRef.current.play().catch(() => {});
    audioStarted.current = true;
  };

  const openTheater = () => {
    setIsTheater(true);
    if (!audioStarted.current) startAudio();
    else audioRef.current?.play().catch(() => {});
  };

  const closeTheater = () => {
    setIsTheater(false);
    audioRef.current?.pause();
  };

  /* ── Shared controls renderer ── */
  const renderControls = (size = 'sm') => (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: size === 'sm' ? '0.65rem 1.25rem' : '1rem 1.5rem',
      gap: '0.75rem',
      borderTop: '1px solid var(--border)',
    }}>
      <button
        style={iconBtn}
        onClick={() => setCurrent(p => (p - 1 + slideCount) % slideCount)}
        title="Previous"
      >
        <ChevronLeft size={size === 'sm' ? 16 : 20} />
      </button>

      <DotNav current={current} total={slideCount} onGo={setCurrent} size={size} />

      <button
        style={iconBtn}
        onClick={() => setIsPlaying(p => !p)}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={size === 'sm' ? 16 : 20} /> : <Play size={size === 'sm' ? 16 : 20} />}
      </button>

      <button
        style={iconBtn}
        onClick={() => setCurrent(p => (p + 1) % slideCount)}
        title="Next"
      >
        <ChevronRight size={size === 'sm' ? 16 : 20} />
      </button>
    </div>
  );

  return (
    <>
      <audio ref={audioRef} src="/audio/bg-music.mp3" loop preload="none" />

      {/* ══ INLINE PLAYER ══ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderLeft: '4px solid var(--primary)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow)',
          overflow: 'hidden',
          marginTop: '1.5rem',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 1.25rem',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.95rem' }}>🎬</span>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--text-secondary)',
            }}>
              How to Use
            </span>
          </div>
          <motion.button
            onClick={openTheater}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              background: 'var(--secondary)',
              color: 'white', border: 'none',
              borderRadius: '999px',
              padding: '0.35rem 0.85rem',
              fontSize: '0.75rem', fontWeight: 600,
              cursor: 'pointer', letterSpacing: '0.02em',
            }}
          >
            <Maximize2 size={12} /> Expand
          </motion.button>
        </div>

        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '16/9', background: '#0f172a', overflow: 'hidden' }}>
          <SlideImage baseUrl={baseUrl} index={current} fileExtension={fileExtension} />
          <ProgressBar progress={progress} height={4} />
        </div>

        {/* Controls */}
        {renderControls('sm')}
      </motion.div>

      {/* ══ THEATER MODE PORTAL ══ */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isTheater && (
            <motion.div
              key="theater-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => { if (e.target === e.currentTarget) closeTheater(); }}
              style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.88)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '2rem',
              }}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                style={{
                  width: '90vw', maxWidth: '1100px',
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                  boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
                  borderLeft: '4px solid var(--primary)',
                }}
              >
                {/* Theater Header */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.9rem 1.5rem',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span>🎬</span>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 700,
                      letterSpacing: '0.12em', textTransform: 'uppercase',
                      color: 'var(--text-secondary)',
                    }}>
                      How to Use — Setup Guide
                    </span>
                  </div>
                  <button
                    onClick={closeTheater}
                    style={{ ...iconBtn, padding: '0.4rem 0.75rem', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    <X size={16} /> Close
                  </button>
                </div>

                {/* Theater Image */}
                <div style={{ position: 'relative', aspectRatio: '16/9', background: '#0f172a', overflow: 'hidden' }}>
                  <SlideImage baseUrl={baseUrl} index={current} fileExtension={fileExtension} />
                  <ProgressBar progress={progress} height={5} />
                </div>

                {/* Theater Controls */}
                {renderControls('lg')}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
