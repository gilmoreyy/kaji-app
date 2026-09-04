-- AlterTable
ALTER TABLE "Siswa" DROP COLUMN "foto_profil",
ADD COLUMN     "foto_profil_data" BYTEA,
ADD COLUMN     "foto_profil_mimetype" TEXT;

-- AlterTable
ALTER TABLE "Jadwal_Pertemuan" DROP COLUMN "assignment_path",
ADD COLUMN     "assignment_data" BYTEA;
