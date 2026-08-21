import ComplaintFeed from './components/ComplaintFeed';
import Navbar from './components/Navbar'
import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";

export default async function Home() {
  let complaints = [];
  let databaseError = false;

  try {
    complaints = await prisma.complaint.findMany({
      take: 50,
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
  } catch (error) {
    databaseError = true;
    console.error("Failed to load complaints:", error);
  }

  return (
    <div>
      <Navbar />
      {databaseError && (
        <div className="mx-10 mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Database is not connected yet, so complaints cannot be loaded.
        </div>
      )}
      <ComplaintFeed initialComplaints={complaints}/>
    </div>
  );
}
