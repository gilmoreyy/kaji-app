-- AlterTable
ALTER TABLE "Jadwal_Pertemuan" ADD COLUMN     "assignment_nama_file" TEXT,
ADD COLUMN     "assignment_path" TEXT,
ADD COLUMN     "catatan" TEXT,
ADD COLUMN     "id_bab" INTEGER,
ADD COLUMN     "skor" DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "Jadwal_Pertemuan" ADD CONSTRAINT "Jadwal_Pertemuan_id_bab_fkey" FOREIGN KEY ("id_bab") REFERENCES "Bab"("id_bab") ON DELETE SET NULL ON UPDATE CASCADE;

