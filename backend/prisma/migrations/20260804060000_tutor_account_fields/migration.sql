-- AlterTable
ALTER TABLE "Tutor" ADD COLUMN     "display_name" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "no_hp" TEXT,
ADD COLUMN     "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Tutor_username_key" ON "Tutor"("username");

