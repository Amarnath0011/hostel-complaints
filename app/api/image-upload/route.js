/**
 * @param {Request} req
 */

import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
    try {
        const body = await req.formData();
        const file = body.get("file");
        if(!file) {
            return Response.json({error:"no file found"}, {status:400});
        }
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
    
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {folder:"hostel_complaints"},
                (error, result) => {
                    if(error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });
        return Response.json({message:"Image upload successful", url:result.secure_url}, {status:200})
    } catch (error) {
        console.log("upload error", error);
        return Response.json({ error: "Upload failed" }, { status: 500 });
    }
}