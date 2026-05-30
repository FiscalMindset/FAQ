import { useState, useEffect } from 'react';
import api from '../services/api';

const AdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterStatus, setFilterStatus] = useState('new');
  const [suggestedFAQ, setSuggestedFAQ] = useState(null);
  const [suggesting, setSuggesting] = useState(false);
  const [grouping, setGrouping] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [filterStatus]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/questions', { params: { status: filterStatus } });
      setQuestions(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load questions.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === questions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(questions.map(q => q._id));
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/api/questions/${id}/status`, { status: newStatus });
      fetchQuestions();
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  const handleGroup = async () => {
    if (selectedIds.length < 2) {
      setError('Select at least 2 questions to group.');
      return;
    }
    setGrouping(true);
    try {
      const category = prompt('Enter category for grouped questions (or press OK for default):');
      await api.post('/api/questions/group', { questionIds: selectedIds, category: category || 'general' });
      setSelectedIds([]);
      fetchQuestions();
    } catch (err) {
      setError('Failed to group questions.');
    } finally {
      setGrouping(false);
    }
  };

  const handleSuggestFAQ = async () => {
    if (selectedIds.length === 0) {
      setError('Select at least 1 question.');
      return;
    }
    setSuggesting(true);
    try {
      const response = await api.post('/api/questions/suggest-faq', { questionIds: selectedIds });
      setSuggestedFAQ(response.data);
    } catch (err) {
      setError('Failed to generate FAQ suggestion.');
    } finally {
      setSuggesting(false);
    }
  };

  const handleCreateFAQ = async () => {
    if (!suggestedFAQ) return;
    try {
      await api.post('/api/faqs', {
        question: suggestedFAQ.suggested.question,
        answer: suggestedFAQ.suggested.answer,
        category: suggestedFAQ.category,
        source_questions: suggestedFAQ.source_questions
      });
      setSuggestedFAQ(null);
      setSelectedIds([]);
      fetchQuestions();
    } catch (err) {
      setError('Failed to create FAQ.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.delete(`/api/questions/${id}`);
      fetchQuestions();
    } catch (err) {
      setError('Failed to delete question.');
    }
  };

  const statuses = ['new', 'grouped', 'reviewed', 'converted_to_faq', 'rejected'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Questions</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
          {error}
          <button onClick={() => setError(null)} className="float-right font-bold">×</button>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          {statuses.map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>

        {selectedIds.length > 0 && (
          <>
            <button
              onClick={handleGroup}
              disabled={grouping}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {grouping ? 'Grouping...' : `Group (${selectedIds.length})`}
            </button>
            <button
              onClick={handleSuggestFAQ}
              disabled={suggesting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {suggesting ? 'Generating...' : 'Suggest FAQ'}
            </button>
          </>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="loading-spinner"></div></div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No questions found.</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === questions.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left">Question</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Source</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map(q => (
                <tr key={q._id} className="border-t">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(q._id)}
                      onChange={() => toggleSelect(q._id)}
                    />
                  </td>
                  <td className="px-4 py-3">{q.text}</td>
                  <td className="px-4 py-3">{q.category}</td>
                  <td className="px-4 py-3">{q.source}</td>
                  <td className="px-4 py-3">
                    <select
                      value={q.status}
                      onChange={(e) => handleStatusChange(q._id, e.target.value)}
                      className="text-sm border rounded px-2 py-1 mr-2"
                    >
                      {statuses.map(s => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDelete(q._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {suggestedFAQ && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Suggested FAQ</h2>
            <div className="mb-4">
              <label className="block font-medium mb-1">Question:</label>
              <p className="bg-gray-50 p-3 rounded">{suggestedFAQ.suggested.question}</p>
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Answer:</label>
              <p className="bg-gray-50 p-3 rounded">{suggestedFAQ.suggested.answer}</p>
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Category:</label>
              <p className="bg-gray-50 p-3 rounded">{suggestedFAQ.category}</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleCreateFAQ}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >Create FAQ</button>
              <button
                onClick={() => setSuggestedFAQ(null)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuestions;