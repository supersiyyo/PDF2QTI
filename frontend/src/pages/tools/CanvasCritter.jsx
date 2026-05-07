import React from 'react';
import { motion } from 'framer-motion';
import { Download, AlertTriangle, Gamepad2 } from 'lucide-react';

const CanvasCritter = () => {
  return (
    <div className="app-container">
      <header className="header">
        <h1>Canvas Critter</h1>
        <p>A fun, interactive desktop application built to help you navigate your coursework.</p>
      </header>

      <motion.div 
        className="surface-card" 
        style={{ borderColor: 'var(--primary)', marginBottom: '2rem' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ padding: '8px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--primary)', fontSize: '1.1rem' }}>Beta Release (90% Complete)</h3>
            <p style={{ margin: 0, color: 'var(--text-light)', lineHeight: '1.5' }}>
              Canvas Critter is currently in active development. This Windows build is a nearly-complete beta version. You might encounter small bugs, but the core functionality is ready for you to try!
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="surface-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <Gamepad2 size={48} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
          <h2 style={{ marginBottom: '1rem' }}>Download for Windows</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
            Get the standalone executable. Built with the Godot Engine. No installation required—just extract the zip file and run <code style={{background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px'}}>Canvas Critter.exe</code>.
          </p>
          
          <a 
            href="https://csun.sose.dev/downloads/mostrecentCancanbuild90percentdone.zip" 
            className="btn btn-primary"
            style={{ display: 'inline-flex', padding: '12px 24px', fontSize: '1.1rem', textDecoration: 'none' }}
          >
            <Download size={20} style={{ marginRight: '8px' }} />
            Download Beta Build (.zip)
          </a>
          
          <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
            File size: ~100MB • Requires Windows 10/11 64-bit
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CanvasCritter;
