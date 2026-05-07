import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, Wrench, Hammer, X, ChevronRight } from 'lucide-react';
import './UpdatesModule.css';

const UpdatesModule = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Handle Hydration safely
  useEffect(() => {
    setHasMounted(true);
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const response = await fetch('/changelog.json');
      if (!response.ok) throw new Error('Failed to fetch changelog');
      const data = await response.json();
      setUpdates(data);
    } catch (error) {
      console.error('Error loading updates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!hasMounted) return null;

  const displayUpdates = updates.slice(0, 3);

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const getIcon = (type) => {
    if (type === 'feature') return <Sparkles size={16} className="icon-feature" />;
    return <Wrench size={16} className="icon-fix" />;
  };

  return (
    <>
      <div className="updates-module glass-panel">
        <div className="updates-header">
          <h3>Platform Updates</h3>
          <span className="updates-badge">New</span>
        </div>

        <div className="updates-list-container">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="updates-skeleton"
              >
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton-item" />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="content"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="updates-list"
              >
                {displayUpdates.map((update) => (
                  <motion.div
                    key={update.id}
                    variants={itemVariants}
                    whileHover={{ scale: shouldReduceMotion ? 1 : 1.02 }}
                    whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
                    className="update-card"
                  >
                    <div className="update-card-header">
                      <div className="update-title-group">
                        {getIcon(update.type)}
                        <span className="update-title">{update.title}</span>
                      </div>
                      {update.version && <span className="update-version">{update.version}</span>}
                    </div>
                    <p className="update-description">{update.description}</p>
                    <span className="update-date">{new Date(update.date).toLocaleDateString()}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          className="view-all-btn"
          onClick={() => setIsModalOpen(true)}
        >
          View Full History
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Elegant Modal for Full History */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div 
              className="modal-content glass-panel"
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Changelog History</h2>
                <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="modal-body">
                {updates.map(update => (
                  <div key={update.id} className="history-item">
                    <div className="history-header">
                      <div className="history-title-group">
                        {getIcon(update.type)}
                        <h4>{update.title}</h4>
                      </div>
                      <div className="history-meta">
                        {update.version && <span className="update-version">{update.version}</span>}
                        <span className="update-date">{new Date(update.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p>{update.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default React.memo(UpdatesModule);
