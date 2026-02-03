// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST (req){
    try {
        const body = await req.json();
        const {id, password} = body;
        if(!id || !password) return Response.json({ error: "Missing Required fields" }, { status: 400 });
        if (/\s/.test(password)) {
            return Response.json(
                { error: "Password cannot contain spaces" },
                { status: 400 }
            );
        }
        const passwordRegex = /^(?=.*[!@#$%^&*])(?=.{8,})/;
        if (!passwordRegex.test(password)) {
            return Response.json({ error: "Password too weak" }, { status: 400 });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({where:{id}, data:{password:hashedPassword}});
        return Response.json({message:"Password changed"}, {status:200});
    } catch (error) {
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}