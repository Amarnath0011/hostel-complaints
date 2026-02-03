import generateOTP from "@/lib/otp";
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // change this to just otp sent to your email
      return Response.json({ error: "No account found with this email" }, { status: 404 });
    }

    const otpRecord = await generateOTP(user.id, "PASSWORD_RESET");
    
    console.log("Password Reset OTP for", email, "is", otpRecord.code);

    return Response.json({ userId: user.id }, { status: 200 });
  } catch (error) {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}