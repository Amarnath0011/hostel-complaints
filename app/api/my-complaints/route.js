// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
import { prisma } from "@/lib/prisma";

export async function GET (req) {
    const {searchParams} = new URL(req.url);
    const userId = searchParams.get("userId");
    if(!userId) return Response.json({ error: "User ID is required" }, {status:400});
    try {
        const complaints = await prisma.complaint.findMany({where:{userId}, orderBy: { createdAt: 'desc' }});
        return Response.json({data: complaints}, {status:200});
    } catch (error) {
        return Response.json({error:"could not fetch complaints"}, {status:500});
    }
}