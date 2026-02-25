import { prisma } from "@/lib/prisma";
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { cookies } from "next/headers";

export async function POST(req) {
    try {
        const body = await req.json();
        const {email, password} = body;
        const existingUser = await prisma.user.findUnique({where: {email}});
        if(!existingUser) return Response.json({error: "Invalid email or password"}, {status: 401});

        const isPassValid = await bcrypt.compare(password, existingUser.password);

        if(!isPassValid) return Response.json({error: "Invalid email or password"}, {status: 401});

        if(!existingUser.isVerified) return Response.json({error: "Invalid email or password"}, {status: 401});

        const accessToken = jwt.sign({id: existingUser.id}, process.env.ACCESS_SECRET, {expiresIn:'15s'});
        const refreshToken = jwt.sign({id:existingUser.id}, process.env.REFRESH_SECRET, {expiresIn:'15d'});

        const cookie = await cookies();
        cookie.set("refreshToken", refreshToken, {
            httpOnly:true,
            sameSite:"strict",
            // secure
            path:"/",
            maxAge:60*60*24*15,
        })

        return Response.json({success: true, accessToken, user: {id:existingUser.id, name:existingUser.name, email:existingUser.email, role:existingUser.role}}, {status:200})

    } catch (error) {
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}