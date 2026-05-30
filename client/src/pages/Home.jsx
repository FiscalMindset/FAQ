import { useState, useEffect } from 'react';
import api from '../services/api';

const Home = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await api.get('/api/faqs/published');
      setFaqs(response.data);
      setError(null);
    } catch (err) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        setError('Failed to load FAQs. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(faqs.map(faq => faq.category))];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
        <p className="text-gray-600">Find answers to the most common questions</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search FAQs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
      )}

      {filteredFaqs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {faqs.length === 0 ? 'No FAQs available yet.' : 'No FAQs match your search.'}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFaqs.map(faq => (
            <details key={faq._id} className="bg-white rounded-lg shadow-sm border group">
              <summary className="px-6 py-4 cursor-pointer font-medium text-gray-900 hover:text-blue-600 list-none">
                <span className="flex items-center justify-between">
                  <span>{faq.question}</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </span>
                {faq.category && faq.category !== 'general' && (
                  <span className="text-xs text-blue-600 mt-1 block">{faq.category}</span>
                )}
              </summary>
              <div className="px-6 pb-4 text-gray-600">{faq.answer}</div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;