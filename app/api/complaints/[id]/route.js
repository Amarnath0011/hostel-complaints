import { prisma } from "@/lib/prisma";
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