import React, { useState } from 'react';
import { Download, ArrowLeft } from 'lucide-react';

const PreviewEditor = ({ initialData, onExport, onReset }) => {
  // initialData structural assumption: { quiz_title: "", questions: [...] }
  const [data, setData] = useState(initialData);

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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button 
          onClick={onReset} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 500 }}
        >
          <ArrowLeft size={18} /> Start Over
        </button>
        <button 
          className="btn-primary" 
          style={{ width: 'auto', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }} 
          onClick={() => onExport(data)}
        >
          <Download size={18} /> Download QTI .zip
        </button>
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
            <input 
              type="text"
              className="question-input"
              value={q.question_text}
              onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
              placeholder={`Question ${qIndex + 1}`}
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
