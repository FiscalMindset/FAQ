import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const formatIST = (date) => {
  return new Date(date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
};

const emails = {
  faqCreated: (data) => ({
    subject: `📝 New FAQ Created: ${data.faq.question}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New FAQ Created</h2>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Question:</strong> ${data.faq.question}</p>
          <p><strong>Answer:</strong> ${data.faq.answer}</p>
          <p><strong>Category:</strong> ${data.faq.category}</p>
          <p><strong>Status:</strong> ${data.faq.status}</p>
          <p><strong>Created By:</strong> ${data.user_name} (${data.user_email})</p>
          <p><strong>AI Generated:</strong> ${data.faq.is_ai_generated ? '🤖 Yes' : '❌ No'}</p>
          <p><strong>Source Questions:</strong> ${data.faq.source_questions?.length || 0}</p>
        </div>
        <p style="color: #6b7280; font-size: 12px;">
          Time (IST): ${formatIST(data.timestamp)}
        </p>
      </div>
    `
  }),

  faqApproved: (data) => ({
    subject: `✅ FAQ Approved: ${data.faq.question}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">FAQ Approved</h2>
        <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Question:</strong> ${data.faq.question}</p>
          <p><strong>Category:</strong> ${data.faq.category}</p>
          <p><strong>Approved By:</strong> ${data.user_name} (${data.user_email})</p>
          <p><strong>AI Generated:</strong> ${data.faq.is_ai_generated ? '🤖 Yes' : '❌ No'}</p>
        </div>
        <p style="color: #6b7280; font-size: 12px;">
          Time (IST): ${formatIST(data.timestamp)}
        </p>
      </div>
    `
  }),

  faqPublished: (data) => ({
    subject: `🎉 FAQ Published: ${data.faq.question}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">FAQ Published!</h2>
        <div style="background: #ede9fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Question:</strong> ${data.faq.question}</p>
          <p><strong>Answer:</strong> ${data.faq.answer}</p>
          <p><strong>Category:</strong> ${data.faq.category}</p>
          <p><strong>Views:</strong> ${data.faq.views || 0}</p>
          <p><strong>Published By:</strong> ${data.user_name} (${data.user_email})</p>
          <p><strong>AI Generated:</strong> ${data.faq.is_ai_generated ? '🤖 Yes' : '❌ No'}</p>
        </div>
        <p style="color: #6b7280; font-size: 12px;">
          Time (IST): ${formatIST(data.timestamp)}
        </p>
      </div>
    `
  }),

  faqRejected: (data) => ({
    subject: `❌ FAQ Rejected: ${data.faq.question}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">FAQ Rejected</h2>
        <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Question:</strong> ${data.faq.question}</p>
          <p><strong>Category:</strong> ${data.faq.category}</p>
          <p><strong>Rejected By:</strong> ${data.user_name} (${data.user_email})</p>
          <p><strong>Previous Status:</strong> ${data.faq.status}</p>
        </div>
        <p style="color: #6b7280; font-size: 12px;">
          Time (IST): ${formatIST(data.timestamp)}
        </p>
      </div>
    `
  }),

  faqDeleted: (data) => ({
    subject: `🗑️ FAQ Deleted: ${data.faq.question}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6b7280;">FAQ Deleted</h2>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Question:</strong> ${data.faq.question}</p>
          <p><strong>Category:</strong> ${data.faq.category}</p>
          <p><strong>Status at Deletion:</strong> ${data.faq.status}</p>
          <p><strong>Deleted By:</strong> ${data.user_name} (${data.user_email})</p>
        </div>
        <p style="color: #6b7280; font-size: 12px;">
          Time (IST): ${formatIST(data.timestamp)}
        </p>
      </div>
    `
  }),

  questionSubmitted: (data) => ({
    subject: `❓ New Question Submitted: ${data.question.text.substring(0, 50)}...`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0891b2;">New Question Received</h2>
        <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Question:</strong> ${data.question.text}</p>
          <p><strong>Category:</strong> ${data.question.category}</p>
          <p><strong>Source:</strong> ${data.question.source}</p>
          <p><strong>Submitted By:</strong> ${data.user_name || 'Guest'} (${data.user_email || 'N/A'})</p>
        </div>
        <p style="color: #6b7280; font-size: 12px;">
          Time (IST): ${formatIST(data.timestamp)}
        </p>
      </div>
    `
  }),

  aiSuggestion: (data) => ({
    subject: `🤖 AI Suggested FAQ: ${data.suggestion.question.substring(0, 50)}...`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8b5cf6;">AI FAQ Suggestion</h2>
        <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Suggested Question:</strong> ${data.suggestion.question}</p>
          <p><strong>Suggested Answer:</strong> ${data.suggestion.answer}</p>
          <p><strong>Source Questions:</strong> ${data.source_count} questions grouped</p>
          <p><strong>Generated By:</strong> Google Gemini AI</p>
          <p><strong>Triggered By:</strong> ${data.user_name} (${data.user_email})</p>
        </div>
        <p style="color: #6b7280; font-size: 12px;">
          Time (IST): ${formatIST(data.timestamp)}
        </p>
      </div>
    `
  })
};

export const sendEmail = async (type, data) => {
  if (!process.env.SMTP_HOST) {
    console.log('SMTP not configured, skipping email notification');
    return;
  }

  try {
    const emailData = emails[type](data);
    await transporter.sendMail({
      from: `"FAQ Generator" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: emailData.subject,
      html: emailData.html
    });
    console.log(`Email notification sent: ${type}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    return false;
  }
};

export default transporter;
