import { prisma } from "@/lib/prisma";
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
import bcrypt from 'bcrypt';

export async function POST(req) {
    try {
        const body = await req.json();
        const {email, password} = body;
        const existingUser = await prisma.user.findUnique({where: {email}});
        if(!existingUser) return Response.json({error: "Invalid email or password"}, {status: 401});

        const isPassValid = await bcrypt.compare(password, existingUser.password);

        if(!isPassValid) return Response.json({error: "Invalid email or password"}, {status: 401});

        if(!existingUser.isVerified) return Response.json({error: "Invalid email or password"}, {status: 401});

        return Response.json({success: true, id:existingUser.id, name:existingUser.name, email:existingUser.email, role:existingUser.role}, {status:200})

    } catch (error) {
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}