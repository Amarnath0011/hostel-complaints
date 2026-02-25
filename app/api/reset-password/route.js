// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'

export async function POST (req){
    try {
        const body = await req.json();
        const {token, password} = body;
        const authHeader = req.headers.get('authorization');
        let userId;

        if(token) {
            const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
            userId = decoded.userId;
        } else if(authHeader) {
            const accessToken = authHeader.split(" ")[1];
            const decoded = jwt.verify(accessToken, process.env.ACCESS_SECRET);
            userId = decoded.id;
        }
        if (!userId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

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
        await prisma.user.update({where:{id:userId}, data:{password:hashedPassword}});
        return Response.json({message:"Password changed"}, {status:200});
    } catch (error) {
        console.log(error.message)
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}