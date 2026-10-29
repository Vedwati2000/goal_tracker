import React, { useState, useEffect } from 'react';
import api from '../api';
import SpeechInput from './SpeechInput';

function ReflectionPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [inputMode, setInputMode] = useState('text');
  const [reflectionText, setReflectionText] = useState('');
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    setSelectedGoal('');

    if (selectedStudent) {
      fetchGoals();
      fetchReflections();
    } else {
      setGoals([]);
      setReflections([]);
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/api/students');

      console.log('Students API Response:', res.data);

      const studentList = Array.isArray(res.data)
        ? res.data
        : res.data?.students;

      if (!Array.isArray(studentList)) {
        throw new Error('Invalid students API response');
      }

      setStudents(studentList);

      if (studentList.length > 0) {
        setSelectedStudent((current) =>
          studentList.some(s => s._id === current)
            ? current
            : studentList[0]._id
        );
      } else {
        setSelectedStudent('');
      }

    } catch (err) {
      console.error('Fetch Students Error:', err);
      setStudents([]);
      setSelectedStudent('');
      setError('Failed to load students');
    }
  };

  const fetchGoals = async () => {
    try {
      const res = await api.get(`/api/goals/${selectedStudent}`);

      console.log('Goals API Response:', res.data);

      const goalList = Array.isArray(res.data)
        ? res.data
        : res.data?.goals;

      if (!Array.isArray(goalList)) {
        throw new Error('Invalid goals API response');
      }

      setGoals(goalList);

    } catch (err) {
      console.error('Fetch Goals Error:', err);
      setGoals([]);
      setError('Failed to load goals');
    }
  };

  const fetchReflections = async () => {
    try {
      const res = await api.get(
        `/api/reflections/${selectedStudent}`
      );

      console.log('Reflections API Response:', res.data);

      const reflectionList = Array.isArray(res.data)
        ? res.data
        : res.data?.reflections;

      if (!Array.isArray(reflectionList)) {
        throw new Error('Invalid reflections API response');
      }

      setReflections(reflectionList);

    } catch (err) {
      console.error('Fetch Reflections Error:', err);
      setReflections([]);
      setError('Failed to load reflections');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reflectionText.trim() || !selectedStudent) {
      setError('Please enter your reflection and select a student');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const student = students.find(
        s => s._id === selectedStudent
      );

      if (!student) {
        setError('Selected student not found');
        return;
      }

      await api.post('/api/reflections', {
        reflectionText,
        studentId: selectedStudent,
        studentName: student.name,
        goalId: selectedGoal || null,
        inputMethod: inputMode
      });

      setMessage('Reflection saved with AI feedback');

      setReflectionText('');
      setSelectedGoal('');

      await fetchReflections();

    } catch (err) {
      console.error('Submit Reflection Error:', err);
      setError(
        err.response?.data?.message ||
        'Failed to save reflection'
      );

    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;

      window.speechSynthesis.speak(utterance);
    } else {
      setError('Speech synthesis is not supported in this browser');
    }
  };

  return (
    <div>

      <div className="card">
        <h2>Share Your Reflection</h2>

        {error && (
          <div className="error">{error}</div>
        )}

        {message && (
          <div className="success">{message}</div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Select Student</label>

            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="">-- Select Student --</option>

              {Array.isArray(students) &&
                students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} - {s.grade}
                  </option>
                ))
              }

            </select>
          </div>

          <div className="form-group">
            <label>Related Goal (Optional)</label>

            <select
              value={selectedGoal}
              onChange={(e) => setSelectedGoal(e.target.value)}
            >
              <option value="">-- No specific goal --</option>

              {Array.isArray(goals) &&
                goals.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.goalText?.substring(0, 50)}...
                  </option>
                ))
              }

            </select>
          </div>

          <div className="form-group">
            <label>Input Method</label>

            <div className="input-mode-toggle">

              <button
                type="button"
                className={inputMode === 'text' ? 'active' : ''}
                onClick={() => setInputMode('text')}
              >
                Text Input
              </button>

              <button
                type="button"
                className={inputMode === 'speech' ? 'active' : ''}
                onClick={() => setInputMode('speech')}
              >
                Speech Input
              </button>

            </div>
          </div>

          {inputMode === 'speech' && (
            <div className="form-group">
              <SpeechInput
                onTranscript={setReflectionText}
                placeholder="Speak your reflection clearly"
              />
            </div>
          )}

          <div className="form-group">
            <label>Your Reflection</label>

            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="Share your thoughts on your progress..."
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !selectedStudent}
          >
            {loading ? 'Processing...' : 'Submit Reflection'}
          </button>

        </form>
      </div>

      <div className="card">
        <h2>Previous Reflections</h2>

        {reflections.length === 0 ? (

          <p>No reflections yet.</p>

        ) : (

          reflections.map((r) => (

            <div
              key={r._id}
              className="reflection-item"
            >

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}
              >

                <strong>
                  {new Date(r.createdAt).toDateString()}
                </strong>

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px'
                  }}
                  onClick={() => speakText(r.reflectionText)}
                >
                  Read Aloud
                </button>

              </div>

              <p>{r.reflectionText}</p>

              {r.aiFeedback && (

                <div className="ai-feedback">

                  <strong>AI Feedback:</strong>

                  <p>{r.aiFeedback}</p>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => speakText(r.aiFeedback)}
                  >
                    Listen to AI Feedback
                  </button>

                </div>

              )}

            </div>

          ))

        )}

      </div>

    </div>
  );
}

export default ReflectionPage;