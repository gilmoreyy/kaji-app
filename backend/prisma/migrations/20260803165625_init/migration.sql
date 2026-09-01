-- CreateTable
CREATE TABLE "Tutor" (
    "id_tutor" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "kata_sandi" TEXT NOT NULL,

    CONSTRAINT "Tutor_pkey" PRIMARY KEY ("id_tutor")
);

-- CreateTable
CREATE TABLE "Siswa" (
    "id_siswa" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenjang" TEXT NOT NULL,
    "asal_sekolah" TEXT NOT NULL,
    "universitas_tujuan" TEXT NOT NULL,
    "id_tutor" TEXT NOT NULL,

    CONSTRAINT "Siswa_pkey" PRIMARY KEY ("id_siswa")
);

-- CreateTable
CREATE TABLE "Bab" (
    "id_bab" SERIAL NOT NULL,
    "nama_bab" TEXT NOT NULL,
    "urutan_bab" INTEGER NOT NULL,

    CONSTRAINT "Bab_pkey" PRIMARY KEY ("id_bab")
);

-- CreateTable
CREATE TABLE "Progres_Siswa" (
    "id_progres" TEXT NOT NULL,
    "id_siswa" TEXT NOT NULL,
    "id_bab" INTEGER NOT NULL,
    "skor_bab" DOUBLE PRECISION NOT NULL,
    "tanggal_update" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Progres_Siswa_pkey" PRIMARY KEY ("id_progres")
);

-- CreateTable
CREATE TABLE "Jadwal_Pertemuan" (
    "id_jadwal" TEXT NOT NULL,
    "id_siswa" TEXT NOT NULL,
    "tanggal_pertemuan" DATE NOT NULL,
    "waktu_pertemuan" TEXT NOT NULL,

    CONSTRAINT "Jadwal_Pertemuan_pkey" PRIMARY KEY ("id_jadwal")
);

-- CreateTable
CREATE TABLE "Rekomendasi" (
    "id_rekomendasi" TEXT NOT NULL,
    "id_siswa" TEXT NOT NULL,
    "id_bab" INTEGER NOT NULL,
    "skor_prioritas" DOUBLE PRECISION NOT NULL,
    "tanggal_dihasilkan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rekomendasi_pkey" PRIMARY KEY ("id_rekomendasi")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tutor_email_key" ON "Tutor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Bab_urutan_bab_key" ON "Bab"("urutan_bab");

-- CreateIndex
CREATE UNIQUE INDEX "Progres_Siswa_id_siswa_id_bab_key" ON "Progres_Siswa"("id_siswa", "id_bab");

-- AddForeignKey
ALTER TABLE "Siswa" ADD CONSTRAINT "Siswa_id_tutor_fkey" FOREIGN KEY ("id_tutor") REFERENCES "Tutor"("id_tutor") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progres_Siswa" ADD CONSTRAINT "Progres_Siswa_id_siswa_fkey" FOREIGN KEY ("id_siswa") REFERENCES "Siswa"("id_siswa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progres_Siswa" ADD CONSTRAINT "Progres_Siswa_id_bab_fkey" FOREIGN KEY ("id_bab") REFERENCES "Bab"("id_bab") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jadwal_Pertemuan" ADD CONSTRAINT "Jadwal_Pertemuan_id_siswa_fkey" FOREIGN KEY ("id_siswa") REFERENCES "Siswa"("id_siswa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rekomendasi" ADD CONSTRAINT "Rekomendasi_id_siswa_fkey" FOREIGN KEY ("id_siswa") REFERENCES "Siswa"("id_siswa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rekomendasi" ADD CONSTRAINT "Rekomendasi_id_bab_fkey" FOREIGN KEY ("id_bab") REFERENCES "Bab"("id_bab") ON DELETE CASCADE ON UPDATE CASCADE;
