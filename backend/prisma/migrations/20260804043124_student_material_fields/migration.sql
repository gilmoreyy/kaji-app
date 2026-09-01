-- AlterTable
ALTER TABLE "Bab" ADD COLUMN     "ringkasan" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Siswa" ADD COLUMN     "email" TEXT,
ADD COLUMN     "jurusan" TEXT,
ADD COLUMN     "no_hp" TEXT,
ADD COLUMN     "sisa_sesi" INTEGER NOT NULL DEFAULT 0;
