import generateOTP from "@/lib/otp";
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
import { prisma } from "@/lib/prisma";

export async function POST(req) {
    try {
        const body = await req.json();
        const {userId, type} = body;

        if(!userId || !type) {
            return Response.json({error: "missing required info"}, {status:400});
        }
        const user = await prisma.user.findUnique({where: {id:userId}});
        if(!user) {
            return Response.json({error: "user not found"}, {status:404});
        }
        if(type === "SIGNUP" && user.isVerified) {
            return Response.json({ error: "Account already verified" }, { status: 400 });
        }
        const newOTP = await generateOTP(userId, type);

        //todo send via nodemailer
        console.log(`Resent ${type} OTP for ${user.email}: ${newOTP.code}`);

        return Response.json({ success: true, message: "OTP Resent" });
    } catch (error) {
      return Response.json({ error: "Server error" }, { status: 500 });
    }
}