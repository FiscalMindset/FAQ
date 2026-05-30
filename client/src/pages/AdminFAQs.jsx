import { useState, useEffect } from 'react';
import api from '../services/api';

const AdminFAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingFaq, setEditingFaq] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importData, setImportData] = useState('');

  useEffect(() => {
    fetchFaqs();
  }, [filterStatus]);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const response = await api.get('/api/faqs', { params });
      setFaqs(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load FAQs. ' + (err.response?.data?.error || ''));
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

  const handleBulkImport = async () => {
    try {
      const lines = importData.trim().split('\n');
      const imported = [];
      const errors = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split('|').map(p => p.trim());
        if (parts.length < 2) {
          errors.push(`Line ${i + 1}: Invalid format. Use "question | answer" or "question|answer"`);
          continue;
        }
        
        imported.push({
          question: parts[0],
          answer: parts[1],
          category: parts[2] || 'general',
          status: 'draft'
        });
      }

      if (imported.length === 0) {
        setError('No valid FAQs to import. Format: question | answer | category');
        return;
      }

      for (const faq of imported) {
        await api.post('/api/faqs', faq);
      }

      setImportModalOpen(false);
      setImportData('');
      fetchFaqs();
      alert(`Successfully imported ${imported.length} FAQs. ${errors.length > 0 ? '\nErrors: ' + errors.length : ''}`);
    } catch (err) {
      setError('Failed to import FAQs. ' + (err.response?.data?.error || ''));
    }
  };

  const statuses = ['draft', 'approved', 'published', 'rejected'];

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Manage FAQs</h1>
        <div className="flex flex-wrap gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            {statuses.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={() => setImportModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
          >
            Bulk Import
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold">×</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="loading-spinner"></div></div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500 mb-4">No FAQs found.</p>
          <p className="text-sm text-gray-400">Create FAQs from grouped questions or bulk import.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map(faq => (
            <div key={faq._id} className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
              {editingFaq?._id === faq._id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Question:</label>
                    <input
                      type="text"
                      value={editingFaq.question}
                      onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Answer:</label>
                    <textarea
                      value={editingFaq.answer}
                      onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleUpdate(faq._id, editingFaq)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >Save Changes</button>
                    <button
                      onClick={() => setEditingFaq(null)}
                      className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-sm"
                    >Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{faq.question}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {faq.category}
                        </span>
                        <span className={`px-2 py-1 rounded text-sm ${getStatusBadgeColor(faq.status)}`}>
                          {faq.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={faq.status}
                        onChange={(e) => handleStatusChange(faq._id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        {statuses.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{faq.answer}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <button
                      onClick={() => setEditingFaq({ question: faq.question, answer: faq.answer, category: faq.category })}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >Edit</button>
                    <button
                      onClick={() => handleDelete(faq._id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >Delete</button>
                    <span className="text-gray-400 text-xs">
                      Created: {new Date(faq.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {importModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Bulk Import FAQs</h2>
            <p className="text-sm text-gray-600 mb-4">
              Format: <code className="bg-gray-100 px-1 rounded">question | answer | category</code>
              <br />One FAQ per line. Category is optional (defaults to "general").
            </p>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              rows={10}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="What is your return policy? | We offer 30-day returns | billing&#10;How do I contact support? | Email us at support@example.com | support"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleBulkImport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >Import FAQs</button>
              <button
                onClick={() => { setImportModalOpen(false); setImportData(''); }}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFAQs;