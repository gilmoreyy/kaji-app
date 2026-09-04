import { PrismaClient } from '@prisma/client'

// Foto profil & assignment PDF disimpan sebagai Bytes langsung di Postgres (lihat
// getFoto/getAssignmentFile). Di-omit secara global supaya endpoint list/detail biasa
// tidak ikut menyeret binary besar itu di tiap response — cuma diambil eksplisit
// oleh query di kedua controller yang menyajikan filenya.
const prisma = new PrismaClient({
  omit: {
    siswa: { foto_profil_data: true },
    jadwal_Pertemuan: { assignment_data: true },
  },
})

export default prisma
