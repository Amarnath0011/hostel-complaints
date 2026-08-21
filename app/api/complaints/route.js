import { prisma } from "@/lib/prisma";
import jwt from 'jsonwebtoken'
import { handleAuthError } from "@/lib/auth";

export async function POST(req) {
    try {
        const body = await req.json();
        //todo implement jwt
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
          return Response.json({ error: "No token provided" }, { status: 401 });
        }
        const token = authHeader?.split(" ")[1];
        if(!token) return Response.json({ error: "Access token missing" }, { status: 401 }); 
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
        const userId = decoded.id;
        
        if(!userId) {
          return Response.json({error: "unauthorized"}, {status:401})
        }

        const {title, description, category, imageUrl, hostel, room} = body;
        if(!title || !description || !category || !hostel || !room) {
            return Response.json({error:"Missing required fields"}, {status:400})
        }
        const complaint = await prisma.complaint.create({
            data: {
                title, description, category, status: "PENDING", userId: userId, imageUrl, hostel, room
            }
        })
        return Response.json(complaint, { status: 201 });
    } catch (error) {
        console.error("Complaint Creation Error:", error);
        return handleAuthError(error);
    }
}

export async function GET(req) {
    try {
      const { searchParams } = new URL(req.url);
  
      const page = Number(searchParams.get("page")) || 1;
      const limit = Number(searchParams.get("limit")) || 10;
  
      const skip = (page - 1) * limit;
  
      const complaints = await prisma.complaint.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });
  
      const total = await prisma.complaint.count();
  
      return Response.json(
        {
          data: complaints,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error(error);
      return Response.json(
        {
          data: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          },
          error: "Database is not connected",
        },
        { status: 200 }
      );
    }
  }
