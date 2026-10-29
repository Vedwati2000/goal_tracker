import React, { useState, useEffect } from 'react';
import api from '../api';

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    grade: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setFetching(true);

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

    } catch (err) {
      console.error('Fetch Students Error:', err);

      setStudents([]);

      setError(
        err.response?.data?.message ||
        'Failed to load students'
      );

    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setMessage('');

    if (!form.name.trim() || !form.grade.trim()) {
      setError('Name and grade are required');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/students', {
        name: form.name.trim(),
        email: form.email.trim(),
        grade: form.grade.trim()
      });

      setMessage('Student added successfully');

      setForm({
        name: '',
        email: '',
        grade: ''
      });

      await fetchStudents();

    } catch (err) {
      console.error('Add Student Error:', err);

      setError(
        err.response?.data?.message ||
        'Failed to add student'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      <div className="card">
        <h2>Add New Student</h2>

        {error && (
          <div className="error">{error}</div>
        )}

        {message && (
          <div className="success">{message}</div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Student Name</label>

            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value
                })
              }
              placeholder="Enter student name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email (for reminders)</label>

            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value
                })
              }
              placeholder="student@example.com"
            />
          </div>

          <div className="form-group">
            <label>Grade</label>

            <input
              type="text"
              value={form.grade}
              onChange={(e) =>
                setForm({
                  ...form,
                  grade: e.target.value
                })
              }
              placeholder="e.g., Grade 10"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Adding Student...' : 'Add Student'}
          </button>

        </form>
      </div>

      <div className="card">

        <h2>All Students ({students.length})</h2>

        {fetching ? (

          <p>Loading students...</p>

        ) : students.length === 0 ? (

          <p>No students found. Add your first student above.</p>

        ) : (

          <div className="goals-list">

            {students.map((s) => (

              <div
                key={s._id}
                className="goal-item"
              >

                <div className="goal-header">

                  <strong>{s.name}</strong>

                  <span className="goal-status active">
                    {s.grade}
                  </span>

                </div>

                {s.email && (
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#666'
                    }}
                  >
                    {s.email}
                  </p>
                )}

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default StudentsPage;