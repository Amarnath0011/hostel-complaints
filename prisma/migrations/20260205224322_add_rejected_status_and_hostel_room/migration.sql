-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "hostel" TEXT,
ADD COLUMN     "room" TEXT;
