const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function createTransporter() {
  // If SMTP env vars are present, use them. Otherwise use Ethereal test account.
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '587', 10),
      secure: false,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
  }

  // Create Ethereal account
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: { user: testAccount.user, pass: testAccount.pass }
  });
}

app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !name.trim() || !email || !email.trim() || !message || !message.trim()) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const transporter = await createTransporter();
  const to = process.env.TO_EMAIL || process.env.SMTP_USER || 'recipient@example.com';

  const mail = {
    from: `${name} <${email}>`,
    to,
    subject: `Contact form message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><p>${message.replace(/\n/g,'<br>')}</p>`
  };

  try {
    const info = await transporter.sendMail(mail);
    // If using Ethereal, there is a preview URL
    const preview = nodemailer.getTestMessageUrl(info) || null;
    return res.json({ ok: true, preview });
  } catch (err) {
    console.error('Failed to send mail', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

app.listen(PORT, () => console.log(`Pract-16 contact demo running on http://localhost:${PORT}`));
