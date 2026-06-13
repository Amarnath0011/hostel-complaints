import { cookies } from "next/headers";
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma";
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

export async function POST (req) {
    const cookie = await cookies();
    const refreshToken = cookie.get("refreshToken")?.value;
    if(!refreshToken) return Response.json({error:"No refresh token"}, {status:401});
    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        const user = await prisma.user.findUnique({where:{id:decoded.id}});

        if (!user) {
            cookie.set("refreshToken", "", {
                httpOnly: true,
                path: "/",
                maxAge: 0,
            });
        
            return Response.json({ error: "User not found" }, { status: 401 });
        }

        const newAccessToken = jwt.sign({id:user.id}, process.env.ACCESS_SECRET, {expiresIn:'15m'});
        return Response.json({accessToken:newAccessToken, user:{id:user.id, name:user.name, role: user.role, email:user.email}});
    } catch (error) {
        return Response.json({ error: "Invalid refresh token" }, { status: 403 });
    }
}