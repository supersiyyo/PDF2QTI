import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Maximize2, X, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

/* ── Time Formatter ──────────────────────────────────────── */
const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === Infinity) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

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

const VideoPlayer = forwardRef(({ src }, ref) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTheater, setIsTheater] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isTheaterLoading, setIsTheaterLoading] = useState(false);
  const [speed, setSpeed] = useState(1);
  const videoRef = useRef(null);
  const theaterVideoRef = useRef(null);
  const containerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    openTheater: () => {
      openTheater();
    },
    scrollIntoView: (options) => {
      containerRef.current?.scrollIntoView(options);
    }
  }));

  const skip = (amount) => {
    const video = isTheater ? theaterVideoRef.current : videoRef.current;
    if (video) video.currentTime += amount;
  };

  const toggleSpeed = () => {
    const newSpeed = speed === 1 ? 2 : 1;
    setSpeed(newSpeed);
    if (videoRef.current) videoRef.current.playbackRate = newSpeed;
    if (theaterVideoRef.current) theaterVideoRef.current.playbackRate = newSpeed;
  };

  const handleTimeUpdate = (e) => {
    const video = e.target;
    if (isTheater && video !== theaterVideoRef.current) return;
    if (!isTheater && video !== videoRef.current) return;
    
    setCurrentTime(video.currentTime);
    setProgress(video.currentTime / video.duration);
  };

  const handleLoadedMetadata = (e) => {
    const video = e.target;
    if (isTheater && video !== theaterVideoRef.current) return;
    if (!isTheater && video !== videoRef.current) return;
    
    setDuration(video.duration);
  };

  const togglePlay = () => {
    const video = isTheater ? theaterVideoRef.current : videoRef.current;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const openTheater = () => {
    const currentTime = videoRef.current.currentTime;
    setIsTheater(true);
    setIsTheaterLoading(true);
    setTimeout(() => {
      if (theaterVideoRef.current) {
        theaterVideoRef.current.currentTime = currentTime;
        theaterVideoRef.current.playbackRate = speed;
        theaterVideoRef.current.play();
        setIsPlaying(true);
      }
    }, 0);
  };

  const closeTheater = () => {
    const currentTime = theaterVideoRef.current.currentTime;
    setIsTheater(false);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTime;
        videoRef.current.play();
        setIsPlaying(true);
      }
    }, 0);
  };

  return (
    <>
      {/* ══ INLINE PLAYER ══ */}
      <motion.div
        ref={containerRef}
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
          marginBottom: '2rem'
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

        {/* Video Area */}
        <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000', overflow: 'hidden' }}>
          {isLoading && (
            <div style={{ 
              position: 'absolute', inset: 0, 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
              background: '#0f172a', zIndex: 1, color: 'white', gap: '1rem'
            }}>
              <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.7, letterSpacing: '0.05em' }}>LOADING GUIDE...</span>
            </div>
          )}

          <video 
            ref={videoRef}
            src={src}
            muted
            autoPlay
            loop
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onLoadedData={() => setIsLoading(false)}
            style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s' }}
          />
          <ProgressBar progress={progress} height={4} />
        </div>

        {/* Controls */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '0.75rem 1.25rem',
          gap: '1.25rem',
          borderTop: '1px solid var(--border)',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Skip Back */}
            <button 
              style={{ ...iconBtn, border: 'none', color: 'var(--text-secondary)' }} 
              onClick={() => skip(-5)} 
              title="Skip back 5s"
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={18} strokeWidth={2.5} />
                <span style={{ fontSize: '8px', fontWeight: 800, marginLeft: '-1px' }}>5</span>
              </div>
            </button>

            {/* Play/Pause */}
            <button
              style={{ 
                background: 'var(--primary)', color: 'white', border: 'none', 
                width: '36px', height: '36px', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 4px 10px rgba(var(--primary-rgb), 0.25)'
              }}
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" style={{ marginLeft: '1px' }} />}
            </button>

            {/* Skip Forward */}
            <button 
              style={{ ...iconBtn, border: 'none', color: 'var(--text-secondary)' }} 
              onClick={() => skip(5)} 
              title="Skip forward 5s"
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '8px', fontWeight: 800, marginRight: '-1px' }}>5</span>
                <ChevronRight size={18} strokeWidth={2.5} />
              </div>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '0.4rem', 
              color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600,
              minWidth: '85px', justifyContent: 'flex-end'
            }}>
              <Clock size={12} />
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Speed Toggle */}
            <button 
              style={{ 
                ...iconBtn, fontSize: '0.7rem', fontWeight: 700, 
                padding: '0.3rem 0.6rem', borderRadius: '6px',
                background: speed === 2 ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent', 
                color: speed === 2 ? 'var(--primary)' : 'var(--text-secondary)',
                borderColor: speed === 2 ? 'var(--primary)' : 'var(--border)'
              }}
              onClick={toggleSpeed}
              title="Toggle Speed"
            >
              {speed}x
            </button>
          </div>
        </div>
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
                      How to Use — Video Guide
                    </span>
                  </div>
                  <button
                    onClick={closeTheater}
                    style={{ ...iconBtn, padding: '0.4rem 0.75rem', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    <X size={16} /> Close
                  </button>
                </div>

                {/* Theater Video */}
                <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000', overflow: 'hidden' }}>
                  {isTheaterLoading && (
                    <div style={{ 
                      position: 'absolute', inset: 0, 
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                      background: '#000', zIndex: 1, color: 'white', gap: '1rem'
                    }}>
                      <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
                    </div>
                  )}

                  <video 
                    ref={theaterVideoRef}
                    src={src}
                    autoPlay
                    loop
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onLoadedData={() => setIsTheaterLoading(false)}
                    style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain', opacity: isTheaterLoading ? 0 : 1, transition: 'opacity 0.5s' }}
                  />
                  <ProgressBar progress={progress} height={5} />
                </div>

                {/* Theater Controls */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  padding: '1.25rem 2rem',
                  gap: '2.5rem',
                  borderTop: '1px solid var(--border)',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {/* Skip Back */}
                    <button 
                      style={{ ...iconBtn, border: 'none', color: 'var(--text-secondary)' }} 
                      onClick={() => skip(-5)} 
                      title="Skip back 5s"
                    >
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ChevronLeft size={32} strokeWidth={2.5} />
                        <span style={{ fontSize: '14px', fontWeight: 800, marginLeft: '-5px' }}>5</span>
                      </div>
                    </button>

                    {/* Play/Pause */}
                    <button
                      style={{ 
                        background: 'var(--primary)', color: 'white', border: 'none', 
                        width: '64px', height: '64px', borderRadius: '18px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: '0 8px 20px rgba(var(--primary-rgb), 0.35)',
                        transition: 'all 0.2s'
                      }}
                      onClick={togglePlay}
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" style={{ marginLeft: '4px' }} />}
                    </button>

                    {/* Skip Forward */}
                    <button 
                      style={{ ...iconBtn, border: 'none', color: 'var(--text-secondary)' }} 
                      onClick={() => skip(5)} 
                      title="Skip forward 5s"
                    >
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, marginRight: '-5px' }}>5</span>
                        <ChevronRight size={32} strokeWidth={2.5} />
                      </div>
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.6rem', 
                      color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 600,
                      minWidth: '120px', justifyContent: 'flex-end'
                    }}>
                      <Clock size={20} />
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    {/* Speed Toggle */}
                    <button 
                      style={{ 
                        ...iconBtn, fontSize: '1.1rem', fontWeight: 700, 
                        padding: '0.6rem 1.4rem', borderRadius: '12px',
                        background: speed === 2 ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent', 
                        color: speed === 2 ? 'var(--primary)' : 'var(--text-secondary)',
                        borderColor: speed === 2 ? 'var(--primary)' : 'var(--border)'
                      }}
                      onClick={toggleSpeed}
                      title="Toggle Speed"
                    >
                      {speed}x
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
});

export default VideoPlayer;
