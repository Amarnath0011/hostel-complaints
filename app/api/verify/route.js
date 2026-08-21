// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
import { prisma } from "@/lib/prisma";
import jwt from 'jsonwebtoken'

export async function POST(req) {
    try{
        const body = await req.json();
        const {enteredOTP, token, type} = body;
        const secret = type === "SIGNUP"
            ? process.env.SIGNUP_SECRET
            : process.env.RESET_PASSWORD_SECRET;
        const decoded = jwt.verify(token, secret);
        const userId = decoded.userId;
        
        const savedOTPRecord = await prisma.oTP.findFirst({where: {userId: userId, type: type }, orderBy: { createdAt: 'desc' }});
        if(!savedOTPRecord) {
            return Response.json({ error: "No OTP found. Please resend." }, { status: 404 });
        }
        if(savedOTPRecord.expiresAt < new Date()) {
            return Response.json({error:"OTP expired. Please request a new one."}, {status:400});
        }
        if(savedOTPRecord.code !== enteredOTP) {
            return Response.json({error:"invalid otp, re-enter"}, {status:400});
        }
        if(type === "SIGNUP") {
            await prisma.$transaction([
                prisma.user.update({where:{id:userId,}, data: {isVerified:true}}),
                prisma.oTP.deleteMany({where:{userId, type}})
            ])
            return Response.json({message:"Email verified successfully"}, {status:200});
        }
        const newToken = jwt.sign({userId}, process.env.RESET_PASSWORD_SECRET, { expiresIn: '5m' })
        if(type === "PASSWORD_RESET") {
            await prisma.oTP.deleteMany({ where: { userId, type } });
            return Response.json({token:newToken, message:"Email verified successfully"}, {status:200});
        }
    } catch(error) {
        console.error("Verification Error:", error);
        return Response.json({error:"Internal server error"}, {status:500});
    }

}
