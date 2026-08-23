import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function sendOTPEmail({ to, otp, type }) {
  const subject =
    type === "SIGNUP"
      ? "Hostel Complaints - Verify your email"
      : "Hostel Complaints - Password reset OTP";

  const purpose = type === "SIGNUP" ? "verify your email" : "reset your password";

  await transporter.sendMail({
    from: `Hostel Complaints <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: `Your OTP is ${otp}. Use this OTP to ${purpose}. It expires in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
        <h2>Hostel Complaints</h2>
        <p>Use the following OTP to ${purpose}:</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP expires in <strong>5 minutes</strong>.</p>
        <p>Do not share this OTP with anyone.</p>
      </div>
    `,
  });
}
