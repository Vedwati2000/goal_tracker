import React, { useState, useEffect } from 'react';
import api from '../api';
import SpeechInput from './SpeechInput';
import Calendar from 'react-calendar';

function GoalPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [inputMode, setInputMode] = useState('text');
  const [goalText, setGoalText] = useState('');
  const [category, setCategory] = useState('Academic');
  const [targetDate, setTargetDate] = useState(new Date());
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchGoals();
    } else {
      setGoals([]);
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
      console.error('Students Error:', err);
      setStudents([]);
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
      console.error('Goals Error:', err);
      setGoals([]);
      setError('Failed to load goals');
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!goalText.trim() || !selectedStudent) {
      setError('Please enter a goal and select a student');
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

      await api.post('/api/goals', {
        goalText,
        studentId: selectedStudent,
        studentName: student.name,
        inputMethod: inputMode,
        category,
        targetDate
      });

      setMessage('Goal saved successfully');
      setGoalText('');

      await fetchGoals();

    } catch (err) {
      console.error('Save Goal Error:', err);
      setError('Failed to save goal');

    } finally {
      setLoading(false);
    }
  };


  const markComplete = async (goalId) => {
    try {
      await api.patch(`/api/goals/${goalId}`, {
        status: 'completed'
      });

      await fetchGoals();

    } catch (err) {
      console.error(err);
      setError('Failed to update goal');
    }
  };

  return (
    <div>

      <div className="card">
        <h2>Set a New Goal</h2>

        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Select Student</label>

            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="">Select Student</option>

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
                onTranscript={setGoalText}
                placeholder="Speak your goal clearly"
              />
            </div>
          )}

          <div className="form-group">
            <label>Your Goal</label>

            <textarea
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="Describe your goal..."
            />
          </div>

          <div className="form-group">
            <label>Category</label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Academic</option>
              <option>Personal</option>
              <option>Career</option>
              <option>Health</option>
              <option>Skills</option>
            </select>
          </div>

          <div className="form-group">
            <label>Target Date</label>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              {targetDate.toDateString()}
            </button>

            {showCalendar && (
              <div className="calendar-container">

                <Calendar
                  onChange={(date) => {
                    if (date instanceof Date) {
                      setTargetDate(date);
                    }
                    setShowCalendar(false);
                  }}
                  value={targetDate}
                  selectRange={false}
                />

              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !selectedStudent}
          >
            {loading ? 'Saving...' : 'Save Goal'}
          </button>

        </form>
      </div>

      <div className="card">
        <h2>My Goals</h2>

        {goals.length === 0 ? (

          <p>No goals yet. Set your first goal above.</p>

        ) : (

          <div className="goals-list">

            {goals.map((goal) => (

              <div
                key={goal._id}
                className={`goal-item ${goal.status}`}
              >

                <div className="goal-header">
                  <strong>{goal.category}</strong>

                  <span className={`goal-status ${goal.status}`}>
                    {goal.status}
                  </span>
                </div>

                <p>{goal.goalText}</p>

                <p
                  style={{
                    fontSize: '12px',
                    color: '#666',
                    marginTop: '8px'
                  }}
                >
                  Target: {new Date(goal.targetDate).toDateString()}
                </p>

                {goal.status === 'active' && (

                  <button
                    className="btn btn-success"
                    style={{ marginTop: '10px' }}
                    onClick={() => markComplete(goal._id)}
                  >
                    Mark Complete
                  </button>

                )}

              </div>

            ))}

          </div>

        )}
      </div>

    </div>
  );
}

export default GoalPage;