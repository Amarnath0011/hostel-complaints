import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const firstNames = [
  "Aarav", "Aditya", "Akash", "Aman", "Ankit", "Arjun", "Ayush", "Dev", "Dhruv", "Harsh",
  "Karan", "Krishna", "Manish", "Mohit", "Nikhil", "Nishant", "Piyush", "Rahul", "Rohit", "Sahil",
  "Shubham", "Siddharth", "Tanish", "Varun", "Vikas", "Vivek", "Yash", "Abhishek", "Anurag", "Deepak"
];

const lastNames = [
  "Kumar", "Singh", "Sharma", "Verma", "Gupta", "Jha", "Prasad", "Sinha", "Pandey", "Mishra",
  "Roy", "Das", "Patel", "Yadav", "Thakur", "Choudhary", "Ranjan", "Mehta", "Sahu", "Tiwari"
];

const complaintTemplates = [
  ["Water leakage in bathroom", "There is continuous water leakage in the bathroom and the floor remains wet."],
  ["Ceiling fan not working", "The ceiling fan has stopped working and the room becomes very uncomfortable."],
  ["Tube light not working", "The tube light in the room is flickering and finally stopped working."],
  ["Mess food quality issue", "The food served in the mess was cold and the quality has been inconsistent."],
  ["Broken washroom tap", "The washroom tap is damaged and water keeps leaking even after closing it."],
  ["Electrical socket damaged", "One of the electrical sockets is loose and should be repaired for safety."],
  ["Room door lock problem", "The room door lock is difficult to operate and sometimes does not lock properly."],
  ["Drainage blockage", "Water is not draining properly from the washroom and there is a bad smell."],
  ["Study table damaged", "The study table drawer is broken and the table needs maintenance."],
  ["Common area cleaning", "The common area has not been cleaned properly for the last few days."],
  ["Internet connectivity issue", "The hostel Wi-Fi connection is unstable and frequently disconnects."],
  ["Water cooler not working", "The water cooler on the floor is not cooling water and needs inspection."],
  ["Broken window latch", "The window latch is damaged and the window cannot be secured properly."],
  ["Mosquito problem", "There are many mosquitoes around the room and common area, requiring pest control."],
  ["Laundry area issue", "The laundry area has a faulty water outlet and needs maintenance."]
];

const hostels = ["Jadunath", "Patel", "Kadam", "Dhiraj", "Ramanujam", "Tilka Manjhi"];
const categories = ["PLUMBING", "ELECTRICAL", "CIVIL", "MESS", "OTHER"];
const statuses = ["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"];

function nameFor(index) {
  return `${firstNames[index % firstNames.length]} ${lastNames[Math.floor(index / firstNames.length) % lastNames.length]}`;
}

async function main() {
  console.log("Starting database seed...");

  const passwordHash = await bcrypt.hash("Test@1234", 10);

  // Remove only data created by this seed so the script is safe to run repeatedly.
  const seededUsers = await prisma.user.findMany({
    where: { email: { startsWith: "seed" } },
    select: { id: true }
  });
  const seededUserIds = seededUsers.map((u) => u.id);

  if (seededUserIds.length) {
    await prisma.comment.deleteMany({ where: { userId: { in: seededUserIds } } });
    await prisma.complaint.deleteMany({ where: { userId: { in: seededUserIds } } });
    await prisma.otp.deleteMany({ where: { userId: { in: seededUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: seededUserIds } } });
  }

  const users = [];

  for (let i = 1; i <= 90; i++) {
    users.push({
      name: nameFor(i - 1),
      email: `seedstudent${String(i).padStart(3, "0")}@nitjsr.ac.in`,
      password: passwordHash,
      role: "STUDENT",
      isVerified: true
    });
  }

  for (let i = 1; i <= 10; i++) {
    users.push({
      name: `Supervisor ${i}`,
      email: `seedsupervisor${String(i).padStart(2, "0")}@nitjsr.ac.in`,
      password: passwordHash,
      role: "SUPERVISOR",
      isVerified: true
    });
  }

  await prisma.user.createMany({ data: users });

  const students = await prisma.user.findMany({
    where: { email: { startsWith: "seedstudent" } },
    orderBy: { email: "asc" }
  });

  const supervisors = await prisma.user.findMany({
    where: { email: { startsWith: "seedsupervisor" } },
    orderBy: { email: "asc" }
  });

  const complaints = [];

  for (let i = 0; i < 100; i++) {
    const [title, description] = complaintTemplates[i % complaintTemplates.length];
    const category = categories[i % categories.length];

    complaints.push({
      title: `${title} - Room ${100 + (i % 20)}`,
      description,
      hostel: hostels[i % hostels.length],
      room: String(100 + (i % 20)),
      category,
      status: statuses[i % statuses.length],
      userId: students[i % students.length].id
    });
  }

  await prisma.complaint.createMany({ data: complaints });

  const seededComplaints = await prisma.complaint.findMany({
    where: { title: { contains: " - Room " } },
    orderBy: { createdAt: "asc" },
    take: 100
  });

  // Add two realistic comments to each seeded complaint.
  const comments = [];
  for (let i = 0; i < seededComplaints.length; i++) {
    const complaint = seededComplaints[i];
    const student = students[i % students.length];
    const supervisor = supervisors[i % supervisors.length];

    comments.push({
      content: "I am following up on this complaint. Please check the issue.",
      userId: student.id,
      complaintId: complaint.id
    });

    comments.push({
      content: "Noted. The maintenance team has been informed and the issue will be checked.",
      userId: supervisor.id,
      complaintId: complaint.id
    });
  }

  await prisma.comment.createMany({ data: comments });

  console.log("\nSeed completed successfully.");
  console.log(`Users created: ${users.length}`);
  console.log(`  Students: 90`);
  console.log(`  Supervisors: 10`);
  console.log(`Complaints created: ${complaints.length}`);
  console.log(`Comments created: ${comments.length}`);
  console.log("\nSeed login password for all generated accounts: Test@1234");
  console.log("Example student: seedstudent001@nitjsr.ac.in");
  console.log("Example supervisor: seedsupervisor01@nitjsr.ac.in");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
