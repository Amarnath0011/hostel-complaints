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

const firstNames = ["Aarav", "Aditya", "Akash", "Aman", "Ankit", "Arjun", "Ayush", "Dev", "Dhruv", "Harsh", "Karan", "Krishna", "Manish", "Mohit", "Nikhil", "Nishant", "Piyush", "Rahul", "Rohit", "Sahil", "Shubham", "Siddharth", "Tanish", "Varun", "Vikas", "Vivek", "Yash", "Abhishek", "Anurag", "Deepak"];
const lastNames = ["Kumar", "Singh", "Sharma", "Verma", "Gupta", "Jha", "Prasad", "Sinha", "Pandey", "Mishra", "Roy", "Das", "Patel", "Yadav", "Thakur", "Choudhary", "Ranjan", "Mehta", "Sahu", "Tiwari"];
const hostels = ["Jadunath", "Patel", "Kadam", "Dhiraj", "Ramanujam", "Tilka Manjhi"];
const categories = ["PLUMBING", "ELECTRICAL", "CIVIL", "MESS", "OTHER"];
const statuses = ["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"];

const complaintTemplates = [
  ["Water leakage in bathroom", "There is continuous water leakage in the bathroom and the floor remains wet.", "PLUMBING", "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1000&q=80"],
  ["Ceiling fan not working", "The ceiling fan has stopped working and the room becomes very uncomfortable.", "ELECTRICAL", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1000&q=80"],
  ["Tube light not working", "The tube light in the room is flickering and finally stopped working.", "ELECTRICAL", "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80"],
  ["Mess food quality issue", "The food served in the mess was cold and the quality has been inconsistent.", "MESS", "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80"],
  ["Broken washroom tap", "The washroom tap is damaged and water keeps leaking even after closing it.", "PLUMBING", "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80"],
  ["Electrical socket damaged", "One of the electrical sockets is loose and should be repaired for safety.", "ELECTRICAL", "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1000&q=80"],
  ["Room door lock problem", "The room door lock is difficult to operate and sometimes does not lock properly.", "CIVIL", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80"],
  ["Drainage blockage", "Water is not draining properly from the washroom and there is a bad smell.", "PLUMBING", "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1000&q=80"],
  ["Study table damaged", "The study table drawer is broken and the table needs maintenance.", "CIVIL", "https://images.unsplash.com/photo-1518455027359-f3f8164ba6b8?auto=format&fit=crop&w=1000&q=80"],
  ["Common area cleaning", "The common area has not been cleaned properly for the last few days.", "OTHER", "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=80"],
  ["Internet connectivity issue", "The hostel Wi-Fi connection is unstable and frequently disconnects.", "OTHER", "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80"],
  ["Water cooler not working", "The water cooler on the floor is not cooling water and needs inspection.", "PLUMBING", "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=1000&q=80"],
  ["Broken window latch", "The window latch is damaged and the window cannot be secured properly.", "CIVIL", "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80"],
  ["Mosquito problem", "There are many mosquitoes around the room and common area, requiring pest control.", "OTHER", "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?auto=format&fit=crop&w=1000&q=80"],
  ["Laundry area issue", "The laundry area has a faulty water outlet and needs maintenance.", "OTHER", "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=1000&q=80"]
];

function nameFor(index) {
  return `${firstNames[index % firstNames.length]} ${lastNames[Math.floor(index / firstNames.length) % lastNames.length]}`;
}

async function main() {
  console.log("Starting database seed...");
  const passwordHash = await bcrypt.hash("Test@1234", 10);

  const seededUsers = await prisma.user.findMany({ where: { email: { startsWith: "seed" } }, select: { id: true } });
  const seededUserIds = seededUsers.map((u) => u.id);
  if (seededUserIds.length) {
    await prisma.comment.deleteMany({ where: { userId: { in: seededUserIds } } });
    await prisma.complaint.deleteMany({ where: { userId: { in: seededUserIds } } });
    await prisma.otp.deleteMany({ where: { userId: { in: seededUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: seededUserIds } } });
  }

  const users = [];
  for (let i = 1; i <= 90; i++) users.push({ name: nameFor(i - 1), email: `seedstudent${String(i).padStart(3, "0")}@nitjsr.ac.in`, password: passwordHash, role: "STUDENT", isVerified: true });
  for (let i = 1; i <= 10; i++) users.push({ name: `Supervisor ${i}`, email: `seedsupervisor${String(i).padStart(2, "0")}@nitjsr.ac.in`, password: passwordHash, role: "SUPERVISOR", isVerified: true });
  await prisma.user.createMany({ data: users });

  const students = await prisma.user.findMany({ where: { email: { startsWith: "seedstudent" } }, orderBy: { email: "asc" } });
  const supervisors = await prisma.user.findMany({ where: { email: { startsWith: "seedsupervisor" } }, orderBy: { email: "asc" } });

  const complaints = [];
  for (let i = 0; i < 100; i++) {
    const [title, description, category, imageUrl] = complaintTemplates[i % complaintTemplates.length];
    complaints.push({
      title: `${title} - Room ${100 + (i % 20)}`,
      description,
      hostel: hostels[i % hostels.length],
      room: String(100 + (i % 20)),
      category,
      imageUrl,
      status: statuses[i % statuses.length],
      userId: students[i % students.length].id
    });
  }
  await prisma.complaint.createMany({ data: complaints });

  const seededComplaints = await prisma.complaint.findMany({ where: { title: { contains: " - Room " } }, orderBy: { createdAt: "asc" }, take: 100 });
  const comments = [];
  for (let i = 0; i < seededComplaints.length; i++) {
    comments.push({ content: "I am following up on this complaint. Please check the issue.", userId: students[i % students.length].id, complaintId: seededComplaints[i].id });
    comments.push({ content: "Noted. The maintenance team has been informed and the issue will be checked.", userId: supervisors[i % supervisors.length].id, complaintId: seededComplaints[i].id });
  }
  await prisma.comment.createMany({ data: comments });

  console.log("\nSeed completed successfully.");
  console.log(`Users created: ${users.length}`);
  console.log(`Complaints created: ${complaints.length}`);
  console.log(`Comments created: ${comments.length}`);
  console.log("\nSeed login password for all generated accounts: Test@1234");
  console.log("Example student: seedstudent001@nitjsr.ac.in");
  console.log("Example supervisor: seedsupervisor01@nitjsr.ac.in");
}

main().catch((error) => { console.error("Seed failed:", error); process.exit(1); }).finally(async () => { await prisma.$disconnect(); await pool.end(); });
