import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import GoalPage from './components/GoalPage';
import ReflectionPage from './components/ReflectionPage';
import AnalyticsPage from './components/AnalyticsPage';
import StudentsPage from './components/StudentsPage';

function NavBar() {
  const location = useLocation();
  return (
    <div className="navbar">
      <h1>Goal Setting & Reflection</h1>
      <div className="nav-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Goals</Link>
        <Link to="/reflections" className={location.pathname === '/reflections' ? 'active' : ''}>Reflections</Link>
        <Link to="/students" className={location.pathname === '/students' ? 'active' : ''}>Students</Link>
        <Link to="/analytics" className={location.pathname === '/analytics' ? 'active' : ''}>Analytics</Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <NavBar />
        <Routes>
          <Route path="/" element={<GoalPage />} />
          <Route path="/reflections" element={<ReflectionPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;