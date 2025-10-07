import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465,
  auth: env.smtp.user && env.smtp.pass ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
});

export async function sendEmail(to: string | string[], subject: string, html: string) {
  const recipients = Array.isArray(to) ? to.join(',') : to;
  await transporter.sendMail({ from: env.smtp.from, to: recipients, subject, html });
}

export function emailTemplate(title: string, lines: string[]): string {
  const items = lines.map((l) => `<p>${l}</p>`).join('');
  return `<div><h3>${title}</h3>${items}</div>`;
}
