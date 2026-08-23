import generateOTP from "@/lib/otp";
import { sendOTPEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    let { email } = await req.json();
    if (!email) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    email = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.isVerified === false) {
      return Response.json({ error: "No account found with this email" }, { status: 404 });
    }

    const otpRecord = await generateOTP(user.id, "PASSWORD_RESET");

    await sendOTPEmail({
      to: user.email,
      otp: otpRecord.code,
      type: "PASSWORD_RESET",
    });

    const resetToken = jwt.sign(
      { userId: user.id, purpose: "password_reset" },
      process.env.RESET_PASSWORD_SECRET,
      { expiresIn: '5m' }
    );

    return Response.json({ resetToken }, { status: 200 });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
