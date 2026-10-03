import 'dotenv/config'
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST as string,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER as string,
    pass: process.env.SMTP_PASS as string,
  },
});

type MailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export const sendMail = async ({ to, subject, html, text }: MailOptions) => {
  return transporter.sendMail({
    from: process.env.MAIL_FROM as string,
    to,
    subject,
    html,
    text,
  });
};
