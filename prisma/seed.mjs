import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const firstNames = ["Aarav","Aditya","Akash","Aman","Ankit","Arjun","Ayush","Dev","Dhruv","Harsh","Karan","Krishna","Manish","Mohit","Nikhil","Nishant","Piyush","Rahul","Rohit","Sahil","Shubham","Siddharth","Tanish","Varun","Vikas","Vivek","Yash","Abhishek","Anurag","Deepak"];
const lastNames = ["Kumar","Singh","Sharma","Verma","Gupta","Jha","Prasad","Sinha","Pandey","Mishra","Roy","Das","Patel","Yadav","Thakur","Choudhary","Ranjan","Mehta","Sahu","Tiwari"];
const hostels = ["Jadunath","Patel","Kadam","Dhiraj","Ramanujam","Tilka Manjhi"];
const statuses = ["PENDING","IN_PROGRESS","RESOLVED","REJECTED"];
const templates = [
  ["Water leakage in bathroom","There is continuous water leakage in the bathroom and the floor remains wet.","PLUMBING","https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1000&q=80"],
  ["Ceiling fan not working","The ceiling fan has stopped working and the room becomes very uncomfortable.","ELECTRICAL","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1000&q=80"],
  ["Tube light not working","The tube light in the room is flickering and has stopped working.","ELECTRICAL","https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80"],
  ["Mess food quality issue","The food served in the mess was cold and the quality has been inconsistent.","MESS","https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80"],
  ["Broken washroom tap","The washroom tap is damaged and water keeps leaking after closing it.","PLUMBING","https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80"],
  ["Electrical socket damaged","One electrical socket is loose and should be repaired for safety.","ELECTRICAL","https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1000&q=80"],
  ["Room door lock problem","The room door lock is difficult to operate and does not lock properly.","CIVIL","https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80"],
  ["Drainage blockage","Water is not draining properly from the washroom and there is a bad smell.","PLUMBING","https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1000&q=80"],
  ["Study table damaged","The study table drawer is broken and the table needs maintenance.","CIVIL","https://images.unsplash.com/photo-1518455027359-f3f8164ba6b8?auto=format&fit=crop&w=1000&q=80"],
  ["Common area cleaning","The common area has not been cleaned properly for the last few days.","OTHER","https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=80"],
  ["Internet connectivity issue","The hostel Wi-Fi connection is unstable and frequently disconnects.","OTHER","https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80"],
  ["Water cooler not working","The water cooler on the floor is not cooling water and needs inspection.","PLUMBING","https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=1000&q=80"]
];

function nameFor(i) { return `${firstNames[i % firstNames.length]} ${lastNames[Math.floor(i / firstNames.length) % lastNames.length]}`; }

async function main() {
  console.log("Starting database seed...");
  const passwordHash = await bcrypt.hash("Test@1234", 10);

  // Remove only records created by this seed. Existing non-seed data is preserved.
  const oldUsers = await prisma.user.findMany({
    where: { OR: [{ email: { startsWith: "seedstudent" } }, { email: { startsWith: "seedsupervisor" } }] },
    select: { id: true }
  });
  const oldIds = oldUsers.map((u) => u.id);
  if (oldIds.length) {
    await prisma.comment.deleteMany({ where: { userId: { in: oldIds } } });
    await prisma.complaint.deleteMany({ where: { userId: { in: oldIds } } });
    await prisma.user.deleteMany({ where: { id: { in: oldIds } } });
  }

  const users = [];
  for (let i = 1; i <= 90; i++) users.push({ name: nameFor(i - 1), email: `seedstudent${String(i).padStart(3, "0")}@nitjsr.ac.in`, password: passwordHash, role: "STUDENT", isVerified: true });
  for (let i = 1; i <= 10; i++) users.push({ name: `Supervisor ${i}`, email: `seedsupervisor${String(i).padStart(2, "0")}@nitjsr.ac.in`, password: passwordHash, role: "SUPERVISOR", isVerified: true });
  await prisma.user.createMany({ data: users });

  const students = await prisma.user.findMany({ where: { email: { startsWith: "seedstudent" } }, orderBy: { email: "asc" } });
  const supervisors = await prisma.user.findMany({ where: { email: { startsWith: "seedsupervisor" } }, orderBy: { email: "asc" } });
  if (students.length !== 90 || supervisors.length !== 10) throw new Error(`User verification failed: ${students.length} students, ${supervisors.length} supervisors`);

  const complaints = Array.from({ length: 100 }, (_, i) => {
    const [baseTitle, description, category, imageUrl] = templates[i % templates.length];
    const room = String(100 + (i % 20));
    return { title: `${baseTitle} - Room ${room}`, description, hostel: hostels[i % hostels.length], room, category, imageUrl, status: statuses[i % statuses.length], userId: students[i % students.length].id };
  });
  await prisma.complaint.createMany({ data: complaints });

  const seededComplaints = await prisma.complaint.findMany({ where: { userId: { in: students.map((s) => s.id) } }, orderBy: { createdAt: "asc" } });
  if (seededComplaints.length !== 100) throw new Error(`Complaint verification failed: ${seededComplaints.length}, expected 100`);

  const comments = Array.from({ length: 200 }, (_, i) => {
    const complaint = seededComplaints[Math.floor(i / 2)];
    return i % 2 === 0
      ? { content: "I am following up on this complaint. Please check the issue.", userId: students[Math.floor(i / 2) % students.length].id, complaintId: complaint.id }
      : { content: "Noted. The maintenance team has been informed and the issue will be checked.", userId: supervisors[Math.floor(i / 2) % supervisors.length].id, complaintId: complaint.id };
  });
  await prisma.comment.createMany({ data: comments });

  const finalUsers = await prisma.user.count({ where: { OR: [{ email: { startsWith: "seedstudent" } }, { email: { startsWith: "seedsupervisor" } }] } });
  const finalComplaints = await prisma.complaint.count({ where: { userId: { in: students.map((s) => s.id) } } });
  const finalComments = await prisma.comment.count({ where: { complaintId: { in: seededComplaints.map((c) => c.id) } } });
  if (finalUsers !== 100 || finalComplaints !== 100 || finalComments !== 200) throw new Error(`Final verification failed: users=${finalUsers}, complaints=${finalComplaints}, comments=${finalComments}`);

  console.log("Seed completed successfully.");
  console.log("Users created: 100 (90 students + 10 supervisors)");
  console.log("Complaints created: 100");
  console.log("Comments created: 200");
  console.log("Seed login password: Test@1234");
  console.log("Example student: seedstudent001@nitjsr.ac.in");
  console.log("Example supervisor: seedsupervisor01@nitjsr.ac.in");
}

main().catch((error) => { console.error("Seed failed:", error); process.exit(1); }).finally(async () => { await prisma.$disconnect(); await pool.end(); });
