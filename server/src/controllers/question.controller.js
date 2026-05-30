import Question from '../models/Question.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const submitQuestion = async (req, res) => {
  try {
    const { text, category, source, email } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Question text is required.' });
    }

    const question = new Question({
      text,
      category: category || 'general',
      source: source || 'manual',
      is_guest: !req.user,
      guest_email: email || null,
      submitted_by: req.user?._id || null
    });

    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getQuestions = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (category) filter.category = category;

    const questions = await Question.find(filter)
      .populate('submitted_by', 'username email')
      .sort({ created_at: -1 });
    
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateQuestionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['new', 'grouped', 'reviewed', 'converted_to_faq', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const question = await Question.findByIdAndUpdate(
      id,
      { status, updated_at: Date.now() },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const groupQuestions = async (req, res) => {
  try {
    const { questionIds, category } = req.body;

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ error: 'Question IDs are required.' });
    }

    const questions = await Question.find({ _id: { $in: questionIds } });
    
    if (questions.length !== questionIds.length) {
      return res.status(404).json({ error: 'Some questions not found.' });
    }

    await Question.updateMany(
      { _id: { $in: questionIds } },
      { status: 'grouped', category: category || questions[0].category, updated_at: Date.now() }
    );

    const updated = await Question.find({ _id: { $in: questionIds } });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const suggestFAQ = async (req, res) => {
  try {
    const { questionIds } = req.body;

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ error: 'Question IDs are required.' });
    }

    const questions = await Question.find({ _id: { $in: questionIds } });

    if (questions.length === 0) {
      return res.status(404).json({ error: 'No questions found.' });
    }

    const questionTexts = questions.map(q => q.text).join('\n');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Based on these user questions, generate one comprehensive FAQ pair:\n\nQuestions:\n${questionTexts}\n\nGenerate a JSON response with this exact structure:
{
  "question": "A clear, concise question that covers the intent of all the input questions",
  "answer": "A comprehensive, helpful answer that addresses all the input questions"
}
Only return valid JSON, no markdown or extra text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let faqData;
    try {
      faqData = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI response.', raw: text });
    }

    res.json({
      suggested: faqData,
      source_questions: questionIds,
      category: questions[0].category
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findByIdAndDelete(id);

    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    res.json({ message: 'Question deleted.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};