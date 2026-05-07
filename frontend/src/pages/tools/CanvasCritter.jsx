import React from 'react';
import { motion } from 'framer-motion';
import { Download, AlertTriangle, Monitor, Sparkles } from 'lucide-react';

const CanvasCritter = () => {
  return (
    <div className="app-container">
      <header className="header">
        <h1>Canvas Critter</h1>
        <p>A desktop application currently being developed by CSUN students for a COMP 380 project.</p>
      </header>

      <motion.div 
        className="surface-card" 
        style={{ 
          borderColor: '#f59e0b',
          backgroundColor: '#fffbeb',
          marginBottom: '2.5rem' 
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ padding: '10px', background: '#fef3c7', borderRadius: '10px', color: '#d97706' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 6px 0', color: '#b45309', fontSize: '1.15rem' }}>Beta Release (90% Complete)</h3>
            <p style={{ margin: 0, color: '#78350f', lineHeight: '1.6' }}>
              Canvas Critter is currently in active development. This Windows build is a nearly-complete beta version. You might encounter small bugs, but the core functionality is ready for you to try!
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="surface-card glass-panel"
        style={{ borderTop: '4px solid var(--primary)', position: 'relative', overflow: 'hidden' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', opacity: 0.05, pointerEvents: 'none' }}>
          <Sparkles size={200} color="var(--primary)" />
        </div>

        <div style={{ textAlign: 'center', padding: '3rem 1rem', position: 'relative', zIndex: 1 }}>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            style={{ display: 'inline-block', marginBottom: '1.5rem' }}
          >
            <div style={{ padding: '20px', background: 'rgba(var(--primary-rgb), 0.05)', borderRadius: '50%' }}>
              <Monitor size={56} color="var(--primary)" />
            </div>
          </motion.div>
          
          <h2 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Download for Windows</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '2.5rem', maxWidth: '550px', margin: '0 auto 2.5rem auto', lineHeight: '1.7', fontSize: '1.05rem' }}>
            Get the standalone executable. No installation required—just extract the zip file and run <code style={{background: 'rgba(0,0,0,0.05)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.9em', color: 'var(--text-color)'}}>Canvas Critter.exe</code>.
          </p>
          
          <motion.a 
            href="https://csun.sose.dev/downloads/mostrecentCancanbuild90percentdone.zip" 
            className="btn btn-primary"
            style={{ display: 'inline-flex', padding: '16px 32px', fontSize: '1.15rem', textDecoration: 'none', borderRadius: '50px', boxShadow: '0 8px 20px rgba(var(--primary-rgb), 0.25)' }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download size={22} style={{ marginRight: '10px' }} />
            Download Beta Build (.zip)
          </motion.a>
          
          <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-light)', opacity: 0.8 }}>
            File size: ~74.4MB • Requires Windows 10/11 64-bit
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CanvasCritter;
