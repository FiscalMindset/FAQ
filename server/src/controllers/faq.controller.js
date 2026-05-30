import FAQ from '../models/FAQ.js';
import Question from '../models/Question.js';

export const createFAQ = async (req, res) => {
  try {
    const { question, answer, category, source_questions } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required.' });
    }

    const faq = new FAQ({
      question,
      answer,
      category: category || 'general',
      source_questions: source_questions || [],
      status: 'draft'
    });

    await faq.save();

    if (source_questions && source_questions.length > 0) {
      await Question.updateMany(
        { _id: { $in: source_questions } },
        { status: 'converted_to_faq', updated_at: Date.now() }
      );
    }

    res.status(201).json(faq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFAQs = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;

    const faqs = await FAQ.find(filter)
      .populate('source_questions', 'text')
      .sort({ created_at: -1 });

    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPublishedFAQs = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { status: 'published' };
    if (category) filter.category = category;

    const faqs = await FAQ.find(filter).sort({ created_at: -1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFAQById = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findById(id).populate('source_questions', 'text');

    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found.' });
    }

    res.json(faq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category, status } = req.body;

    const updateFields = { updated_at: Date.now() };
    if (question) updateFields.question = question;
    if (answer) updateFields.answer = answer;
    if (category) updateFields.category = category;
    if (status) {
      const validStatuses = ['draft', 'approved', 'published', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status.' });
      }
      updateFields.status = status;
    }

    const faq = await FAQ.findByIdAndUpdate(id, updateFields, { new: true });

    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found.' });
    }

    res.json(faq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateFAQStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['draft', 'approved', 'published', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const faq = await FAQ.findByIdAndUpdate(
      id,
      { status, updated_at: Date.now() },
      { new: true }
    );

    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found.' });
    }

    res.json(faq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findByIdAndDelete(id);

    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found.' });
    }

    await Question.updateMany(
      { _id: { $in: faq.source_questions } },
      { status: 'reviewed', updated_at: Date.now() }
    );

    res.json({ message: 'FAQ deleted.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};