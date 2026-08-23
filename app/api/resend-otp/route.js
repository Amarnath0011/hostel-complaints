import generateOTP from "@/lib/otp";
import { sendOTPEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const body = await req.json();
    const { token, type } = body;

    if (!token || !type) {
      return Response.json({ error: "missing required info" }, { status: 400 });
    }

    if (type !== "SIGNUP" && type !== "PASSWORD_RESET") {
      return Response.json({ error: "invalid OTP type" }, { status: 400 });
    }

    const secret = type === "SIGNUP"
      ? process.env.SIGNUP_SECRET
      : process.env.RESET_PASSWORD_SECRET;

    const decoded = jwt.verify(token, secret);
    const userId = decoded.userId;

    if (!userId) {
      return Response.json({ error: "invalid token" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return Response.json({ error: "user not found" }, { status: 404 });
    }

    if (type === "SIGNUP" && user.isVerified) {
      return Response.json({ error: "Account already verified" }, { status: 400 });
    }

    const newOTP = await generateOTP(userId, type);

    await sendOTPEmail({
      to: user.email,
      otp: newOTP.code,
      type,
    });

    return Response.json({ success: true, message: "OTP Resent" });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
