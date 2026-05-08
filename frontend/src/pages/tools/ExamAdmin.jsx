import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import { motion } from 'framer-motion';
import { 
  Users, 
  Download, 
  Trash2, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Search,
  Loader2,
  Lock,
  Unlock,
  BarChart3,
  Calendar,
  Zap
} from 'lucide-react';

const ExamAdmin = () => {
  const { secretId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [secretId]);

  const fetchData = async () => {
    try {
      const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');
      const response = await fetch(`${baseURL}/api/exams/admin/${secretId}`);
      if (!response.ok) throw new Error('Invalid or expired admin link');
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = async (key, value) => {
    try {
      const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');
      const response = await fetch(`${baseURL}/api/exams/admin/${secretId}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value })
      });
      if (!response.ok) throw new Error('Failed to update setting');
      setData({ ...data, [key]: value });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCloseExam = async () => {
    if (!confirm('Are you sure you want to close this exam? No more submissions will be accepted.')) return;
    
    setClosing(true);
    try {
      const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');
      const response = await fetch(`${baseURL}/api/exams/admin/${secretId}/close`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to close exam');
      setData({ ...data, status: 'closed' });
    } catch (err) {
      alert(err.message);
    } finally {
      setClosing(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-12 h-12 text-secondary" />
      </motion.div>
      <p className="text-gray-500 mt-4 font-medium">Accessing Admin Panel...</p>
    </div>
  );

  if (error) return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto mt-12 p-10 surface-card text-center"
      style={{ borderTop: '4px solid var(--error)' }}
    >
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Error</h2>
      <p className="text-gray-600 mb-8">{error}</p>
      <button onClick={() => window.location.href = '/'} className="btn btn-primary w-full">Return Home</button>
    </motion.div>
  );

  const filteredSubmissions = data.submissions.filter(s => 
    s.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.student_id.includes(searchTerm)
  );

  const csvData = [
    ["Email", "Student ID", "Score", "Submitted At"],
    ...data.submissions.map(s => [
      s.student_email, 
      s.student_id, 
      s.score, 
      new Date(s.submitted_at).toLocaleString()
    ])
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="max-w-7xl mx-auto px-6 py-12"
    >
      {/* Sleek Header */}
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '2rem', marginBottom: '4rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800, border: '1px solid #dbeafe', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {data.status}
            </div>
            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#94a3b8', background: '#f8fafc', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
              ADMIN_SECURE
            </span>
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '1.5rem' }}>
            {data.title}
          </h1>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} style={{ color: 'var(--secondary)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{new Date(data.created_at).toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} style={{ color: 'var(--secondary)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <CSVLink 
            data={csvData} 
            filename={`results-${data.title}.csv`}
            className="btn btn-secondary"
            style={{ padding: '0.75rem 1.5rem', borderRadius: '10px' }}
          >
            <Download size={18} />
            Export Data
          </CSVLink>
          {data.status === 'open' && (
            <button 
              onClick={handleCloseExam}
              disabled={closing}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: 'var(--text-primary)', borderColor: 'var(--text-primary)' }}
            >
              {closing ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
              Stop Intake
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', marginBottom: '4rem' }}>
        <div className="glass-panel group" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: 'rgba(59, 130, 246, 0.03)', borderRadius: '0 0 0 100%', transition: 'all 0.3s' }} className="group-hover:scale-110" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Users size={18} style={{ color: '#3b82f6' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Intake</span>
          </div>
          <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{data.submissions.length}</div>
        </div>

        <div className="glass-panel group" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: 'rgba(16, 185, 129, 0.03)', borderRadius: '0 0 0 100%', transition: 'all 0.3s' }} className="group-hover:scale-110" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <BarChart3 size={18} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Class Average</span>
          </div>
          <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
            {data.submissions.length > 0 
              ? (data.submissions.reduce((acc, s) => acc + s.score, 0) / data.submissions.length).toFixed(1) 
              : '0'}<span style={{ fontSize: '1.5rem', color: '#cbd5e1' }}>%</span>
          </div>
        </div>

        <div className="glass-panel group" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: 'rgba(139, 92, 246, 0.03)', borderRadius: '0 0 0 100%', transition: 'all 0.3s' }} className="group-hover:scale-110" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Clock size={18} style={{ color: '#8b5cf6' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Auto-Wipe T-Minus</span>
          </div>
          <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
            {Math.max(0, 24 - Math.floor((new Date() - new Date(data.created_at)) / (1000 * 60 * 60)))}<span style={{ fontSize: '1.5rem', color: '#cbd5e1' }}>h</span>
          </div>
        </div>

        <div className="glass-panel group" style={{ padding: '2rem', position: 'relative', overflow: 'hidden', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Zap size={18} style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live Settings</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
             <button 
                onClick={() => handleToggleSetting('show_score', !data.show_score)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}
             >
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Show Score</span>
                {data.show_score ? <CheckCircle2 size={16} color="var(--success)" /> : <XCircle size={16} color="var(--error)" />}
             </button>
          </div>
        </div>
      </motion.div>

      {/* Ledger Section */}
      <motion.div variants={itemVariants} className="surface-card glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Results Ledger</h3>
            <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Comprehensive submission audit log</p>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Filter results..."
              style={{ padding: '10px 14px 10px 42px', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', width: '280px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: 'white' }}>
              <th style={{ padding: '1.5rem 2rem', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid var(--border)' }}>Student Identity</th>
              <th style={{ padding: '1.5rem 2rem', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid var(--border)' }}>CSUN ID</th>
              <th style={{ padding: '1.5rem 2rem', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>Score</th>
              <th style={{ padding: '1.5rem 2rem', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>Sync Time</th>
            </tr>
          </thead>
          <tbody style={{ background: 'white' }}>
            {filteredSubmissions.map((s, idx) => (
              <tr key={idx} className="ledger-row" style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s' }}>
                <td style={{ padding: '1.5rem 2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', background: '#f8fafc', color: 'var(--secondary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                      {s.student_email[0].toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{s.student_email}</span>
                  </div>
                </td>
                <td style={{ padding: '1.5rem 2rem' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#64748b', background: '#f8fafc', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontWeight: 600 }}>
                    {s.student_id}
                  </span>
                </td>
                <td style={{ padding: '1.5rem 2rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 900, color: s.score >= 70 ? 'var(--success)' : s.score >= 40 ? '#f59e0b' : 'var(--error)' }}>
                    {s.score}%
                  </span>
                </td>
                <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
                    {new Date(s.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <style>{`
        .ledger-row:hover {
          background: #f8faff !important;
        }
      `}</style>
    </motion.div>
  );
};

export default ExamAdmin;
