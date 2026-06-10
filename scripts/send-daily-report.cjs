#!/usr/bin/env node
/**
 * Harmoniq Daily Report Emailer
 * Called by the CEO agent after writing the daily report.
 *
 * Usage:
 *   node scripts/send-daily-report.js "Report subject" "Report body (plain text)"
 *   echo "body" | node scripts/send-daily-report.js "Subject"
 *
 * Required env vars (set on the CEO agent in Paperclip):
 *   GMAIL_FROM          — baymaxade@gmail.com
 *   GMAIL_TO            — vanessaadetoro@gmail.com
 *   GMAIL_APP_PASSWORD  — Gmail App Password (16 chars, no spaces)
 */

const nodemailer = require('nodemailer');

const FROM     = process.env.GMAIL_FROM;
const TO       = process.env.GMAIL_TO;
const PASSWORD = process.env.GMAIL_APP_PASSWORD;

if (!FROM || !TO || !PASSWORD) {
  console.error('Missing env: GMAIL_FROM, GMAIL_TO, GMAIL_APP_PASSWORD must all be set');
  process.exit(1);
}

// Subject from first arg, body from second arg or stdin
const subject = process.argv[2] || `Harmoniq Daily Report — ${new Date().toDateString()}`;
let body = process.argv[3] || '';

async function main() {
  if (!body) {
    // read from stdin
    body = await new Promise((resolve) => {
      let data = '';
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', chunk => { data += chunk; });
      process.stdin.on('end', () => resolve(data.trim()));
    });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: FROM, pass: PASSWORD },
  });

  const html = body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n/g, '<br>');

  const info = await transporter.sendMail({
    from: `"Harmoniq CEO" <${FROM}>`,
    to: TO,
    subject,
    text: body,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h1 style="color:#18005F;font-size:20px;margin-bottom:16px">🎵 Harmoniq</h1>
      ${html}
      <hr style="margin-top:32px;border:none;border-top:1px solid #e0e0e0">
      <p style="color:#999;font-size:12px">Sent by the Harmoniq CEO agent · ${new Date().toISOString()}</p>
    </div>`,
  });

  console.log('Email sent:', info.messageId, '→', TO);
}

main().catch(e => { console.error('Failed to send email:', e.message); process.exit(1); });
