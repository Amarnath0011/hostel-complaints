import { prisma } from "@/lib/prisma";

export async function POST(req) {
    try {
        const body = await req.json();
        //todo implement jwt
        const userId = req.headers.get("userId");
        //todo add image also
        const {title, description, category, imageUrl, hostel, room} = body;
        //todo add room no hostel too here and in schema too
        if(!userId) {
            return Response.json({error: "unauthorized"}, {status:401})
        }
        if(!title || !description || !category) {
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
        return Response.json({error:"Internal server error"}, {status:500})
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
        { error: "Failed to fetch complaints" },
        { status: 500 }
      );
    }
  }