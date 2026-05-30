import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ myQuestions: 0, submittedQuestions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyData();
  }, []);

  const fetchMyData = async () => {
    try {
      const response = await api.get('/api/questions', { params: { status: 'new' } });
      setStats({
        myQuestions: response.data.filter(q => q.submitted_by?._id === user._id).length,
        submittedQuestions: response.data.filter(q => q.submitted_by?._id === user._id)
      });
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-gray-500 text-sm">My Questions</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.myQuestions}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-gray-500 text-sm">Account Type</h3>
          <p className="text-xl font-semibold">{user.role}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-gray-500 text-sm">Member Since</h3>
          <p className="text-lg">{new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">My Submitted Questions</h2>
        {stats.submittedQuestions.length === 0 ? (
          <p className="text-gray-500">No questions submitted yet.</p>
        ) : (
          <ul className="space-y-2">
            {stats.submittedQuestions.map(q => (
              <li key={q._id} className="border-b pb-2">
                <span className="font-medium">{q.text}</span>
                <span className="ml-2 text-sm text-gray-500">- {q.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;