import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, FileText, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import UpdatesModule from '../components/UpdatesModule';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const Home = () => {
  return (
    <motion.div 
      className="home-container"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <motion.section variants={itemVariants} className="hero-section">
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
      </motion.section>

      <div className="home-content-wrapper">
        <motion.section variants={itemVariants} className="home-main">
          <div className="section-header">
            <h2>Featured Tools</h2>
            <div className="header-line"></div>
          </div>
          
          <motion.div className="tools-grid" variants={containerVariants}>
            <motion.div variants={itemVariants} whileHover={{ y: -4 }}>
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
            </motion.div>

            {/* Placeholder for future tools */}
            <motion.div variants={itemVariants} whileHover={{ y: -4 }}>
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
            </motion.div>
          </motion.div>
        </motion.section>
        
        <motion.aside variants={itemVariants} className="home-sidebar">
          <UpdatesModule />
        </motion.aside>
      </div>
    </motion.div>
  );
};

export default Home;
