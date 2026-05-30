import { useState, useEffect } from 'react';
import api from '../services/api';

const AdminFAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('draft');
  const [editingFaq, setEditingFaq] = useState(null);

  useEffect(() => {
    fetchFaqs();
  }, [filterStatus]);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/faqs', { params: { status: filterStatus } });
      setFaqs(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load FAQs.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/api/faqs/${id}/status`, { status: newStatus });
      fetchFaqs();
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await api.delete(`/api/faqs/${id}`);
      fetchFaqs();
    } catch (err) {
      setError('Failed to delete FAQ.');
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      await api.put(`/api/faqs/${id}`, updates);
      setEditingFaq(null);
      fetchFaqs();
    } catch (err) {
      setError('Failed to update FAQ.');
    }
  };

  const statuses = ['draft', 'approved', 'published', 'rejected'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage FAQs</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
          {error}
          <button onClick={() => setError(null)} className="float-right font-bold">×</button>
        </div>
      )}

      <div className="mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          {statuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="loading-spinner"></div></div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No FAQs found.</div>
      ) : (
        <div className="space-y-4">
          {faqs.map(faq => (
            <div key={faq._id} className="bg-white rounded-lg shadow-sm p-6">
              {editingFaq?._id === faq._id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Question:</label>
                    <input
                      type="text"
                      value={editingFaq.question}
                      onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Answer:</label>
                    <textarea
                      value={editingFaq.answer}
                      onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleUpdate(faq._id, editingFaq)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >Save</button>
                    <button
                      onClick={() => setEditingFaq(null)}
                      className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                    >Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{faq.question}</h3>
                      <span className="text-sm text-blue-600">{faq.category}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      faq.status === 'published' ? 'bg-green-100 text-green-800' :
                      faq.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      faq.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>{faq.status}</span>
                  </div>
                  <p className="text-gray-600 mb-4">{faq.answer}</p>
                  <div className="flex items-center gap-4">
                    <select
                      value={faq.status}
                      onChange={(e) => handleStatusChange(faq._id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      {statuses.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setEditingFaq({ question: faq.question, answer: faq.answer, category: faq.category })}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >Edit</button>
                    <button
                      onClick={() => handleDelete(faq._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFAQs;