import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, Wrench, Hammer, X, ChevronRight } from 'lucide-react';
import './UpdatesModule.css';

// Cache updates so we don't refetch when navigating back to Home
let cachedUpdates = null;

const UpdatesModule = () => {
  const [updates, setUpdates] = useState(cachedUpdates || []);
  const [loading, setLoading] = useState(!cachedUpdates);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!cachedUpdates) {
      fetchUpdates();
    }
  }, []);

  const fetchUpdates = async () => {
    try {
      const response = await fetch('/changelog.json');
      if (!response.ok) throw new Error('Failed to fetch changelog');
      const data = await response.json();
      cachedUpdates = data;
      setUpdates(data);
    } catch (error) {
      console.error('Error loading updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Split the YYYY-MM-DD string and create a local date object
    // to prevent timezone shifts (JavaScript treats ISO strings as UTC by default)
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString();
  };

  const displayUpdates = updates.slice(0, 3);

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
          {loading ? (
            <div className="updates-skeleton">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-item" />
              ))}
            </div>
          ) : (
            <div className="updates-list">
              {displayUpdates.map((update) => (
                <motion.div
                  key={update.id}
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
                  <span className="update-date">{formatDate(update.date)}</span>
                </motion.div>
              ))}
            </div>
          )}
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
                        <span className="update-date">{formatDate(update.date)}</span>
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
