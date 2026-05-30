import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true },
  category: { type: String, default: 'general' },
  status: {
    type: String,
    enum: ['draft', 'approved', 'published', 'rejected'],
    default: 'draft'
  },
  source_questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

faqSchema.index({ status: 1, category: 1 });

export default mongoose.model('FAQ', faqSchema);