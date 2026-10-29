import React, { useState, useEffect } from 'react';
import api from '../api';

function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [aiEvaluation, setAiEvaluation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/api/analytics');
      setAnalytics(res.data);
    } catch (err) {
      setError('Failed to load analytics');
    }
  };

  const runAIEvaluation = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/ai-evaluate-students');
      setAiEvaluation(res.data.evaluation);
    } catch (err) {
      setError('Failed to run AI evaluation');
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {analytics && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{analytics.totalStudents}</h3>
              <p>Total Students</p>
            </div>
            <div className="stat-card">
              <h3>{analytics.totalGoals}</h3>
              <p>Total Goals</p>
            </div>
            <div className="stat-card">
              <h3>{analytics.completedGoals}</h3>
              <p>Completed Goals</p>
            </div>
            <div className="stat-card">
              <h3>{analytics.completionRate}%</h3>
              <p>Completion Rate</p>
            </div>
            <div className="stat-card">
              <h3>{analytics.studentsWithoutGoals}</h3>
              <p>Students Without Goals</p>
            </div>
            <div className="stat-card">
              <h3>{analytics.totalReflections}</h3>
              <p>Total Reflections</p>
            </div>
          </div>

          <div className="card">
            <h2>AI Student Evaluation</h2>
            <button
              className="btn btn-primary"
              onClick={runAIEvaluation}
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Run AI Evaluation'}
            </button>
            {aiEvaluation && (
              <div className="ai-feedback" style={{ marginTop: '20px' }}>
                <button
                  className="btn btn-success"
                  style={{ marginBottom: '15px' }}
                  onClick={() => speakText(aiEvaluation)}
                >
                  Read Aloud
                </button>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {aiEvaluation}
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h2>Per-Student Goal Breakdown</h2>
            <div className="goals-list">
              {analytics.goalStats && analytics.goalStats.map((stat, idx) => (
                <div key={idx} className="goal-item">
                  <div className="goal-header">
                    <strong>{stat.studentName}</strong>
                    <span className="goal-status active">
                      {stat.completedCount}/{stat.goalCount} completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AnalyticsPage;