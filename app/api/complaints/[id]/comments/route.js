import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

async function authenticate(req) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return { error: Response.json({ error: "Access token missing" }, { status: 401 }) };
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    return { userId: decoded.id };
  } catch {
    return { error: Response.json({ error: "Invalid or expired token" }, { status: 401 }) };
  }
}

export async function GET(req, { params }) {
  try {
    const { id: complaintId } = await params;
    const auth = await authenticate(req);
    if (auth.error) return auth.error;

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      select: { id: true, userId: true },
    });

    if (!complaint) {
      return Response.json({ error: "Complaint not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true },
    });

    if (!user || (complaint.userId !== auth.userId && user.role !== "SUPERVISOR")) {
      return Response.json({ error: "You are not allowed to view these comments" }, { status: 403 });
    }

    const comments = await prisma.comment.findMany({
      where: { complaintId },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return Response.json({ data: comments }, { status: 200 });
  } catch (error) {
    console.error("GET_COMMENTS_ERROR:", error);
    return Response.json({ error: "Failed to load comments" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { id: complaintId } = await params;
    const auth = await authenticate(req);
    if (auth.error) return auth.error;

    const body = await req.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!content) {
      return Response.json({ error: "Comment cannot be empty" }, { status: 400 });
    }

    if (content.length > 1000) {
      return Response.json({ error: "Comment must be 1000 characters or less" }, { status: 400 });
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      select: { id: true, userId: true },
    });

    if (!complaint) {
      return Response.json({ error: "Complaint not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, name: true, role: true },
    });

    if (!user || (complaint.userId !== auth.userId && user.role !== "SUPERVISOR")) {
      return Response.json({ error: "You are not allowed to comment on this complaint" }, { status: 403 });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: auth.userId,
        complaintId,
      },
      include: {
        user: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return Response.json(comment, { status: 201 });
  } catch (error) {
    console.error("CREATE_COMMENT_ERROR:", error);
    return Response.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
