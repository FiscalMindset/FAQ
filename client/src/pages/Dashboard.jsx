import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myQuestions: 0,
    submittedQuestions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchMyData();
    }
  }, [user]);

  const fetchMyData = async () => {
    try {
      const response = await api.get('/api/questions');
      const myQuestions = response.data.filter(q => 
        q.submitted_by && q.submitted_by._id === user.id
      );
      setStats({
        myQuestions: myQuestions.length,
        submittedQuestions: myQuestions
      });
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">My Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-5 border">
          <h3 className="text-gray-500 text-sm mb-1">My Questions</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.myQuestions}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 border">
          <h3 className="text-gray-500 text-sm mb-1">Account Type</h3>
          <p className="text-xl font-semibold text-purple-600">{user.role}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 border sm:col-span-2 lg:col-span-1">
          <h3 className="text-gray-500 text-sm mb-1">Member Since</h3>
          <p className="text-lg font-medium">{formatDate(user.created_at)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-5 border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">My Submitted Questions</h2>
          <Link 
            to="/submit-question" 
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Submit New
          </Link>
        </div>
        
        {stats.submittedQuestions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mb-4">No questions submitted yet.</p>
            <Link 
              to="/submit-question"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Submit Your First Question
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 text-sm font-medium text-gray-600">Question</th>
                  <th className="pb-2 text-sm font-medium text-gray-600">Category</th>
                  <th className="pb-2 text-sm font-medium text-gray-600">Status</th>
                  <th className="pb-2 text-sm font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.submittedQuestions.map(q => (
                  <tr key={q._id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 pr-4">
                      <div className="max-w-md truncate">{q.text}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {q.category}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        q.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        q.status === 'grouped' ? 'bg-purple-100 text-purple-800' :
                        q.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                        q.status === 'converted_to_faq' ? 'bg-green-100 text-green-800' :
                        q.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {q.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-500">
                      {formatDate(q.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;