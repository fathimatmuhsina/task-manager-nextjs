import nodemailer from "nodemailer";

export async function sendResetEmail(email, token) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  
  const transporter = nodemailer.createTransport({
    service: "Gmail", // or use SMTP
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Task Manager" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your password",
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
    `,
  });
}
