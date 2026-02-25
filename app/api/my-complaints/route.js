// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
import { handleAuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import jwt from 'jsonwebtoken'

export async function GET (req) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
        return Response.json({ error: "No token provided" }, { status: 401 });
    }
    const token = authHeader?.split(" ")[1];
    if(!token) return Response.json({ error: "Access token missing" }, { status: 401 }); 
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
        const userId = decoded.id;
        const complaints = await prisma.complaint.findMany({where:{userId}, orderBy: { createdAt: 'desc' }});
        return Response.json({data: complaints}, {status:200});
    } catch (error) {
        console.error("Auth Error:", error.message);
        return handleAuthError(error);
    }
}