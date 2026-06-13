import { prisma } from "@/lib/prisma";
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { cookies } from "next/headers";

export async function POST(req) {
    try {
        const body = await req.json();
        let {email, password} = body;
        if(email) email = email.trim().toLowerCase();

        if(!email || !password) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({where: {email}});
        if(!existingUser) return Response.json({error: "Invalid email or password"}, {status: 401});

        const isPassValid = await bcrypt.compare(password, existingUser.password);

        if(!isPassValid) return Response.json({error: "Invalid email or password"}, {status: 401});

        if(!existingUser.isVerified) return Response.json({error: "Invalid email or password"}, {status: 401});

        const accessToken = jwt.sign({id: existingUser.id}, process.env.ACCESS_SECRET, {expiresIn:'15m'});
        const refreshToken = jwt.sign({id:existingUser.id}, process.env.REFRESH_SECRET, {expiresIn:'15d'});

        const cookie = await cookies();
        cookie.set("refreshToken", refreshToken, {
            httpOnly:true,
            sameSite:"strict",
            // secure
            path:"/",
            maxAge:60*60*24*15,
            // maxAge:15
        })

        return Response.json({success: true, accessToken, user: {id:existingUser.id, name:existingUser.name, email:existingUser.email, role:existingUser.role}}, {status:200})

    } catch (error) {
        console.log(error)
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}