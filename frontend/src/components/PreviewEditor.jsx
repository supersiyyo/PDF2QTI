import React, { useState } from 'react';
import { Download, ArrowLeft, Zap, Eye, EyeOff, Shuffle, Repeat } from 'lucide-react';

const PreviewEditor = ({ initialData, onExport, onReset, onGenerateExam }) => {
  // initialData structural assumption: { quiz_title: "", questions: [...] }
  const [data, setData] = useState(initialData);
  const [showScore, setShowScore] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleChoices, setShuffleChoices] = useState(false);
  const [singleAttempt, setSingleAttempt] = useState(false);

  const handleTitleChange = (text) => {
    const newData = { ...data };
    newData.quiz_title = text;
    setData(newData);
  };

  const handleQuestionTextChange = (qIndex, text) => {
    const newData = { ...data };
    newData.questions[qIndex].question_text = text;
    setData(newData);
  };

  const handleChoiceChange = (qIndex, cIndex, text) => {
    const newData = { ...data };
    newData.questions[qIndex].choices[cIndex] = text;
    setData(newData);
  };

  const setCorrectAnswer = (qIndex, cIndex) => {
    const newData = { ...data };
    newData.questions[qIndex].correct_answer_index = cIndex;
    setData(newData);
  };

  const handleGenerate = () => {
    const finalData = {
      ...data,
      show_score: showScore,
      shuffle_questions: shuffleQuestions,
      shuffle_choices: shuffleChoices,
      single_attempt: singleAttempt
    };
    onGenerateExam(finalData);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button 
          onClick={onReset} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 500 }}
        >
          <ArrowLeft size={18} /> Start Over
        </button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn-primary" 
            style={{ 
              width: 'auto', 
              margin: 0, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              backgroundColor: '#6b6dff', // SOSE Purple
              borderColor: '#6b6dff'
            }} 
            onClick={handleGenerate}
          >
            <Zap size={18} /> Generate Emergency Exam
          </button>
          <button 
            className="btn-primary" 
            style={{ width: 'auto', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }} 
            onClick={() => onExport(data)}
          >
            <Download size={18} /> Download QTI .zip
          </button>
        </div>
      </div>

      {/* Emergency Exam Settings */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e0e7ff', background: '#f5f7ff' }}>
        <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={14} /> Emergency Lifeboat Configuration
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div 
              onClick={() => setShowScore(!showScore)}
              style={{ 
                width: '40px', height: '22px', borderRadius: '11px', background: showScore ? 'var(--primary)' : '#cbd5e1', 
                position: 'relative', transition: 'all 0.2s' 
              }}
            >
              <div style={{ 
                width: '18px', height: '18px', background: 'white', borderRadius: '50%', 
                position: 'absolute', top: '2px', left: showScore ? '20px' : '2px', transition: 'all 0.2s' 
              }} />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
              {showScore ? <Eye size={14} style={{display:'inline', marginRight:'4px'}}/> : <EyeOff size={14} style={{display:'inline', marginRight:'4px'}}/>} 
              Show Score to Student
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div 
              onClick={() => setShuffleQuestions(!shuffleQuestions)}
              style={{ 
                width: '40px', height: '22px', borderRadius: '11px', background: shuffleQuestions ? 'var(--primary)' : '#cbd5e1', 
                position: 'relative', transition: 'all 0.2s' 
              }}
            >
              <div style={{ 
                width: '18px', height: '18px', background: 'white', borderRadius: '50%', 
                position: 'absolute', top: '2px', left: shuffleQuestions ? '20px' : '2px', transition: 'all 0.2s' 
              }} />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
              <Shuffle size={14} style={{display:'inline', marginRight:'4px'}}/> Shuffle Questions
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div 
              onClick={() => setShuffleChoices(!shuffleChoices)}
              style={{ 
                width: '40px', height: '22px', borderRadius: '11px', background: shuffleChoices ? 'var(--primary)' : '#cbd5e1', 
                position: 'relative', transition: 'all 0.2s' 
              }}
            >
              <div style={{ 
                width: '18px', height: '18px', background: 'white', borderRadius: '50%', 
                position: 'absolute', top: '2px', left: shuffleChoices ? '20px' : '2px', transition: 'all 0.2s' 
              }} />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
              <Shuffle size={14} style={{display:'inline', marginRight:'4px'}}/> Shuffle Choices
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div 
              onClick={() => setSingleAttempt(!singleAttempt)}
              style={{ 
                width: '40px', height: '22px', borderRadius: '11px', background: singleAttempt ? 'var(--primary)' : '#cbd5e1', 
                position: 'relative', transition: 'all 0.2s' 
              }}
            >
              <div style={{ 
                width: '18px', height: '18px', background: 'white', borderRadius: '50%', 
                position: 'absolute', top: '2px', left: singleAttempt ? '20px' : '2px', transition: 'all 0.2s' 
              }} />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
              <Repeat size={14} style={{display:'inline', marginRight:'4px'}}/> Single Attempt Only
            </span>
          </label>
        </div>
      </div>

      <div className="surface-card">
        <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          Preview & Edit Quiz
          <span style={{ fontSize: '0.75rem', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '12px', fontWeight: 600, border: '1px solid #dbeafe' }}>
            {data?.questions?.length || 0} Questions
          </span>
        </h2>

        <div style={{ marginBottom: '3rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Quiz Title</label>
          <input 
            type="text"
            value={data?.quiz_title || ''}
            onChange={(e) => handleTitleChange(e.target.value)}
            style={{ width: '100%', fontSize: '1.5rem', fontWeight: 700, padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--primary)' }}
            placeholder="Enter Quiz Title"
          />
        </div>
        
        {data?.questions?.map((q, qIndex) => (
          <div key={qIndex} className="question-block">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ 
                backgroundColor: 'var(--primary)', 
                color: '#fff', 
                fontSize: '0.65rem', 
                fontWeight: 700, 
                padding: '2px 8px', 
                borderRadius: '4px',
                textTransform: 'uppercase'
              }}>
                Question {qIndex + 1}
              </span>
            </div>
            <input 
              type="text"
              className="question-input"
              value={q.question_text}
              onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
              placeholder={`Enter question text`}
            />
            
            <div className="choices-list">
              {q.choices.map((choice, cIndex) => {
                const isCorrect = q.correct_answer_index === cIndex;
                return (
                  <div key={cIndex} className="choice-item">
                    <input 
                      type="radio" 
                      name={`question-${qIndex}`} 
                      className="choice-radio"
                      checked={isCorrect}
                      onChange={() => setCorrectAnswer(qIndex, cIndex)}
                    />
                    <input 
                      type="text" 
                      className="choice-input" 
                      style={{ 
                        borderColor: isCorrect ? 'var(--success)' : 'var(--border)',
                        backgroundColor: isCorrect ? '#f0fdf4' : 'transparent'
                      }}
                      value={choice}
                      onChange={(e) => handleChoiceChange(qIndex, cIndex, e.target.value)}
                      placeholder={`Choice ${String.fromCharCode(65 + cIndex)}`}
                    />
                    {isCorrect && <span className="correct-badge">Correct</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviewEditor;
