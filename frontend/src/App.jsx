import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Pages
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import ToolsCategory from './pages/ToolsCategory';
import PDF2QTI from './pages/tools/PDF2QTI';
import DailyByteGenerator from './pages/tools/DailyByteGenerator';
import DailyBytePlayer from './pages/tools/DailyBytePlayer';

// Global Styles
import './App.css'; // You may keep or remove this if relying purely on index.css

function App() {
  return (
    <BrowserRouter>
      <div className="platform-app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            
            <Route path="/instructor" element={<ToolsCategory category="instructor" />} />
            <Route path="/student" element={<ToolsCategory category="student" />} />
            
            <Route path="/instructor/pdf2qti" element={<PDF2QTI />} />
            
            <Route path="/student/daily-byte" element={<DailyByteGenerator />} />
            <Route path="/student/daily-byte/play" element={<DailyBytePlayer />} />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
