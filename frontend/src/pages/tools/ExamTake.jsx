import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, ChevronRight, User, Mail, Hash, BookOpen, ShieldCheck } from 'lucide-react';

const ExamTake = () => {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('verify'); // 'verify', 'taking', 'submitted'
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    fetchExam();
  }, [examId]);

  const fetchExam = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/exams/${examId}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to load exam');
      }
      const data = await response.json();
      setExam(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onVerify = (data) => {
    // Basic regex validation for CSUN email and 9-digit ID is handled by hook-form
    setStep('taking');
    window.scrollTo(0, 0);
  };

  const onSubmitExam = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const answers = exam.questions.map((_, index) => {
      const val = formData.get(`q-${index}`);
      return val !== null ? parseInt(val) : -1;
    });

    if (answers.includes(-1)) {
      if (!confirm('You have unanswered questions. Submit anyway?')) return;
    }

    setSubmitting(true);
    try {
      // Get student info from previous step
      // Since we don't store it in a state that persists across steps easily without a parent or ref, 
      // let's just assume we have it or use a simple state. 
      // For this demo, I'll just use the form data from the verify step if I had kept it.
      // Let's quickly fix the verify step to store student info.
    } catch (err) {
      alert('Submission failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Re-writing the component to be more robust with state
  return <ExamTakeContent 
    exam={exam} 
    loading={loading} 
    error={error} 
    examId={examId}
  />;
};

// Refactored for better state management
const ExamTakeContent = ({ exam, loading, error, examId }) => {
  const [step, setStep] = useState('verify');
  const [studentInfo, setStudentInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm();

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-12 h-12 text-primary" />
      </motion.div>
      <p className="text-gray-500 mt-4 font-medium">Loading your exam...</p>
    </div>
  );

  if (error) return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto mt-12 p-8 surface-card text-center"
      style={{ borderTop: '4px solid var(--error)' }}
    >
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
      <p className="text-gray-600 mb-8">{error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="btn btn-primary w-full"
      >
        Retry
      </button>
    </motion.div>
  );

  const handleVerify = (data) => {
    setStudentInfo(data);
    setStep('taking');
    window.scrollTo(0, 0);
  };

  const handleSubmitExam = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const answers = exam.questions.map((_, index) => {
      const val = formData.get(`q-${index}`);
      return val !== null ? parseInt(val) : -1;
    });

    if (answers.includes(-1)) {
      if (!confirm('You have unanswered questions. Submit anyway?')) return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8000/api/exams/${examId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_email: studentInfo.email,
          student_id: studentInfo.studentId,
          answers_json: answers
        })
      });

      if (!response.ok) throw new Error('Submission failed');
      const data = await response.json();
      setScore(data.score);
      setStep('submitted');
      window.scrollTo(0, 0);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {step === 'verify' && (
        <motion.div 
          key="verify"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="assessment-container"
          style={{ maxWidth: '480px' }}
        >
          <div className="surface-card glass-panel" style={{ padding: '3rem 2.5rem', borderTop: '6px solid var(--primary)' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: '#fef2f2', color: 'var(--primary)',
                padding: '6px 16px', borderRadius: '20px',
                fontSize: '0.75rem', fontWeight: 700, border: '1px solid #fee2e2',
                marginBottom: '1.5rem'
              }}>
                <ShieldCheck size={14} />
                <span style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>Identity Verification</span>
              </div>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: '0.75rem' }}>
                {exam.title}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>
                Enter your credentials to access this assessment.
              </p>
            </div>

            <form onSubmit={handleSubmit(handleVerify)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', tracking: '0.05em' }}>CSUN Email</label>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace' }}>@my.csun.edu</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                  <input 
                    {...register("email", { 
                      required: "Required",
                      pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@my\.csun\.edu$/,
                        message: "Invalid format"
                      }
                    })}
                    placeholder="student@my.csun.edu"
                    style={{
                      width: '100%', padding: '12px 14px 12px 42px',
                      background: '#f8fafc', border: '1px solid var(--border)',
                      borderRadius: '10px', fontSize: '0.95rem', fontWeight: 500,
                      outline: 'none', transition: 'all 0.2s'
                    }}
                  />
                </div>
                {errors.email && <span style={{ color: 'var(--error)', fontSize: '0.75rem', fontWeight: 600 }}>{errors.email.message}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', tracking: '0.05em' }}>Student ID</label>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace' }}>9-Digits</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <Hash style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                  <input 
                    {...register("studentId", { 
                      required: "Required",
                      pattern: {
                        value: /^\d{9}$/,
                        message: "Must be 9 digits"
                      }
                    })}
                    placeholder="123456789"
                    style={{
                      width: '100%', padding: '12px 14px 12px 42px',
                      background: '#f8fafc', border: '1px solid var(--border)',
                      borderRadius: '10px', fontSize: '0.95rem', fontWeight: 500,
                      outline: 'none', transition: 'all 0.2s'
                    }}
                  />
                </div>
                {errors.studentId && <span style={{ color: 'var(--error)', fontSize: '0.75rem', fontWeight: 600 }}>{errors.studentId.message}</span>}
              </div>

              <div style={{ background: '#f0f9ff', border: '1px solid #e0f2fe', padding: '1rem', borderRadius: '12px', display: 'flex', gap: '10px' }}>
                <AlertCircle size={18} style={{ color: '#0ea5e9', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '0.75rem', color: '#0369a1', lineHeight: 1.5, fontWeight: 500 }}>
                  By proceeding, you acknowledge the CSUN academic integrity policy. This session is logged.
                </p>
              </div>

              <button 
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontSize: '1rem', boxShadow: '0 10px 15px -3px rgba(var(--primary-rgb), 0.2)' }}
              >
                Join Assessment <ChevronRight size={18} style={{ marginLeft: '4px' }} />
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {step === 'taking' && (
        <motion.div 
          key="taking"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="assessment-container"
          style={{ maxWidth: '800px', paddingBottom: '10rem' }}
        >
          {/* Sleek sticky header */}
          <header style={{
            position: 'sticky', top: '80px', zIndex: 100,
            background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)',
            border: '1px solid var(--border)', borderRadius: '16px',
            padding: '1rem 1.5rem', marginBottom: '2.5rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--primary)', color: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyCenter: 'center', display: 'flex', justifyContent: 'center' }}>
                <BookOpen size={20} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{exam.title}</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                   <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace' }}>{studentInfo.email}</span>
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#eff6ff', color: '#1d4ed8',
              padding: '4px 12px', borderRadius: '20px',
              fontSize: '0.7rem', fontWeight: 700, border: '1px solid #dbeafe'
            }}>
              <span>{exam.questions.length} Questions</span>
            </div>
          </header>

          <form onSubmit={handleSubmitExam} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {exam.questions.map((q, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                className="surface-card glass-panel"
                style={{ padding: '2.5rem' }}
              >
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div style={{
                    width: '32px', height: '32px', background: '#f1f5f9',
                    color: '#475569', borderRadius: '8px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontWeight: 800, fontFamily: 'monospace'
                  }}>{idx + 1}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '2rem' }}>
                      {q.question_text}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {q.choices.map((choice, cIdx) => (
                        <label 
                          key={cIdx}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: '12px',
                            padding: '1.25rem', background: '#f8fafc', border: '1px solid var(--border)',
                            borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s'
                          }}
                          className="choice-hover"
                        >
                          <input 
                            type="radio" 
                            name={`q-${idx}`} 
                            value={cIdx}
                            required
                            style={{ marginTop: '4px' }}
                          />
                          <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{choice}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button 
                type="submit" 
                disabled={submitting}
                className="btn btn-primary"
                style={{ width: '100%', padding: '1.5rem', borderRadius: '20px', fontSize: '1.5rem', fontWeight: 900, boxShadow: '0 20px 25px -5px rgba(var(--primary-rgb), 0.3)' }}
              >
                {submitting ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                    <Loader2 size={24} style={{ animation: 'sk-spin 1s linear infinite' }} />
                    Recording Submission...
                  </div>
                ) : 'Complete Assessment'}
              </button>
              <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
                Once submitted, you will receive your final score immediately.
              </p>
            </div>
          </form>
        </motion.div>
      )}

      {step === 'submitted' && (
        <motion.div 
          key="submitted"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="assessment-container"
          style={{ maxWidth: '480px' }}
        >
          <div className="surface-card glass-panel" style={{ padding: '4rem 3rem', textAlign: 'center' }}>
            <div style={{ width: '100px', height: '100px', background: '#f0fdf4', color: '#10b981', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
              <CheckCircle2 size={56} />
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1rem' }}>Success!</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', fontWeight: 500, marginBottom: '3rem' }}>
              Your answers have been recorded.
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '24px', padding: '2.5rem', marginBottom: '3rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: '#e2e8f0' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  style={{ height: '100%', background: 'var(--success)' }}
                />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', tracking: '0.1em' }}>Final Assessment Score</span>
              <div style={{ fontSize: '6rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, marginTop: '0.5rem' }}>
                {score}<span style={{ fontSize: '2.5rem', color: '#cbd5e1' }}>%</span>
              </div>
            </div>

            <button onClick={() => window.location.href = '/'} className="btn btn-secondary" style={{ width: '100%', padding: '1rem' }}>
              Return to Tools Home
            </button>
          </div>
        </motion.div>
      )}

      <style>{`
        .choice-hover:hover {
          background: #eff6ff !important;
          border-color: #3b82f6 !important;
          transform: translateX(4px);
        }
        @keyframes sk-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AnimatePresence>
  );
};

export default ExamTake;
