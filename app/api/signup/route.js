import generateOTP from '@/lib/otp';
import {prisma} from '@/lib/prisma'
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
export async function POST(req) {
  try {
    const body = await req.json();
    let {name, email, password} = body;

    if(email) email = email.trim().toLowerCase();

    if (!name || !email || !password) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    if (/\s/.test(password)) {
      return Response.json(
        { error: "Password cannot contain spaces" },
        { status: 400 }
      );
    }

    if(!email.endsWith("@nitjsr.ac.in")) {
      return Response.json({error:"only NITJSR emails allowed"}, {status:400});
    }

    const passwordRegex = /^(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordRegex.test(password)) {
        return Response.json({ error: "Password too weak" }, { status: 400 });
    }

    const hashedPass = await bcrypt.hash(password, 10);
    let userId;

    const existingUser = await prisma.user.findUnique({where:{email}});
    if(existingUser) {
      if(existingUser.isVerified === true) {
        return Response.json({error: "Email already registered"}, {status: 409})
      }
      //if user comes back to signup then update the details
      const updatedUser = await prisma.user.update({
        where: {id: existingUser.id}, 
        data:{
          name: name,
          password: hashedPass
        }
      })
      userId = updatedUser.id;
    } else {
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPass
        },
      });
      userId = newUser.id;
    }

      //send otp via nodemailer
    const newOTP = await generateOTP(userId, "SIGNUP");
    console.log("OTP for", email, "is", newOTP.code);

    const token = jwt.sign({userId: userId, type: "SIGNUP"}, process.env.SIGNUP_SECRET, {expiresIn:'5m'});

    return Response.json({ success: true, token }, { status: 201 });
  } catch (error) {
    console.error("Registration Error:", error);
    return Response.json({error: "Internal server error"}, {status: 500})
  }
}