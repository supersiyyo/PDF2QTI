import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, FileText, ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Educational Tools Platform</h1>
          <p className="hero-subtitle">
            Free, open-source utilities built for the CSUN community by the Society of Software Engineers.
          </p>
          <div className="hero-actions">
            <Link to="/instructor" className="btn btn-primary">
              <BookOpen size={20} />
              Instructor Tools
            </Link>
            <Link to="/student" className="btn btn-secondary">
              <GraduationCap size={20} />
              Student Tools
            </Link>
          </div>
        </div>
      </section>

      <section className="featured-tools-section">
        <div className="section-header">
          <h2>Featured Tools</h2>
          <div className="header-line"></div>
        </div>
        
        <div className="tools-grid">
          <Link to="/instructor/pdf2qti" className="tool-card featured">
            <div className="tool-card-icon csun-bg">
              <FileText size={28} />
            </div>
            <div className="tool-card-content">
              <h3>PDF to Canvas QTI</h3>
              <p>Transform static PDF documents and quizzes into importable Canvas assessments using AI.</p>
            </div>
            <div className="tool-card-footer">
              <span className="tool-badge instructor">Instructor Tool</span>
              <ArrowRight className="arrow-icon" size={20} />
            </div>
          </Link>

          {/* Placeholder for future tools */}
          <div className="tool-card coming-soon">
            <div className="tool-card-icon default-bg">
              <GraduationCap size={28} />
            </div>
            <div className="tool-card-content">
              <h3>More Tools Coming Soon</h3>
              <p>SOSE is actively developing more utilities to help students succeed.</p>
            </div>
            <div className="tool-card-footer">
              <span className="tool-badge student">Student Tool</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
