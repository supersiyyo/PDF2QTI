import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, GraduationCap, FileText, ArrowRight } from 'lucide-react';

const TOOLS_DATA = [
  {
    id: 'pdf2qti',
    title: 'PDF to Canvas QTI',
    description: 'Transform static PDF documents and quizzes into importable Canvas assessments using AI.',
    category: 'instructor',
    path: '/instructor/pdf2qti',
    icon: <FileText size={28} />,
    colorClass: 'csun-bg'
  }
];

const ToolsCategory = ({ category }) => {
  const isInstructor = category === 'instructor';
  const displayTitle = isInstructor ? 'Instructor Tools' : 'Student Tools';
  const Icon = isInstructor ? BookOpen : GraduationCap;
  const description = isInstructor 
    ? 'Utilities designed to help faculty and instructors streamline their workflow and improve course materials.'
    : 'Resources and tools to help students succeed in their academic journey.';

  const filteredTools = TOOLS_DATA.filter(tool => tool.category === category);

  return (
    <div className="category-container">
      <div className="category-header">
        <div className="category-title-wrapper">
          <Icon size={32} className={isInstructor ? 'instructor-icon' : 'student-icon'} />
          <h1>{displayTitle}</h1>
        </div>
        <p className="category-description">{description}</p>
      </div>

      <div className="tools-grid">
        {filteredTools.length > 0 ? (
          filteredTools.map(tool => (
            <Link key={tool.id} to={tool.path} className="tool-card">
              <div className={`tool-card-icon ${tool.colorClass}`}>
                {tool.icon}
              </div>
              <div className="tool-card-content">
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
              </div>
              <div className="tool-card-footer">
                <span className={`tool-badge ${tool.category}`}>
                  {tool.category === 'instructor' ? 'Instructor Tool' : 'Student Tool'}
                </span>
                <ArrowRight className="arrow-icon" size={20} />
              </div>
            </Link>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              {isInstructor ? <BookOpen size={48} /> : <GraduationCap size={48} />}
            </div>
            <h3>No tools available yet</h3>
            <p>We are currently working on adding more tools to this category. Check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsCategory;
