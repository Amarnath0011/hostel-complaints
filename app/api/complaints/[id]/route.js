import { prisma } from "@/lib/prisma";

// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(req, { params }) {
  try {
      const { id } = await params;

      const userId = req.headers.get("userId");

      if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const existingComplaint = await prisma.complaint.findUnique({where:{id}});

      if (!existingComplaint) {
          return Response.json({ error: "Complaint not found" }, { status: 404 });
      }

      if (existingComplaint.userId !== userId) {
          return Response.json({ error: "You can only delete your own complaints" }, { status: 403 });
      }

      if (existingComplaint.imageUrl) {
        try {
          const splitUrl = existingComplaint.imageUrl.split('/');
          const folderName = splitUrl[splitUrl.length - 2];
          const fileName = splitUrl[splitUrl.length - 1].split('.')[0];
          const publicId = `${folderName}/${fileName}`;

          await cloudinary.uploader.destroy(publicId);
        } catch (cloudErr) {
          console.error("Cloudinary Delete Failed:", cloudErr);
        }
      }

      await prisma.complaint.delete({
          where: { id: id }
      });

      return Response.json({ message: "Complaint deleted successfully" }, { status: 200 });

  } catch (error) {
      console.error("DELETE_ERROR:", error);
      return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req, {params}) {
  try {
    const { id } = await params;

    const existingComplaint = await prisma.complaint.findUnique({where:{id}});
    if (!existingComplaint) {
      return Response.json({ error: "Complaint not found" }, { status: 404 });
    }

    return Response.json(existingComplaint, { status: 200 });
  } catch (error) {
    console.error("get complaint error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const userId = req.headers.get("userId");
    const body = await req.json();

    const existing = await prisma.complaint.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    if ((existing.imageUrl && body.imageUrl && existing.imageUrl !== body.imageUrl) || (existing.imageUrl && body.imageUrl === null)) {
      try {
        const splitUrl = existing.imageUrl.split('/');
        const folderName = splitUrl[splitUrl.length - 2];
        const fileName = splitUrl[splitUrl.length - 1].split('.')[0];
        const publicId = `${folderName}/${fileName}`;

        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.error("Cloudinary Delete Failed:", cloudErr);
      }
    }


    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        hostel: body.hostel,
        room: body.room,
        imageUrl: body.imageUrl
      }
    });

    return Response.json(updated);
  } catch (error) {
    return Response.json({ error: "Update failed" }, { status: 500 });
  }
}