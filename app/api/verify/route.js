// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
import { prisma } from "@/lib/prisma";
export async function POST(req) {
    try{
        const body = await req.json();
        const {enteredOTP, userId, type} = body;
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
    } catch(error) {
        console.error("Verification Error:", error);
        return Response.json({error:"Internal server error"}, {status:500});
    }

}