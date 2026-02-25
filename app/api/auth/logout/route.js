import { cookies } from "next/headers";

export async function POST() {
    const cookieStore = await cookies();
    // clearing the cookie by setting maxAge to 0
    cookieStore.set("refreshToken", "", { 
        httpOnly: true, 
        maxAge: 0,
        path: '/' 
    });

    return Response.json({ message: "Logged out successfully" });
}