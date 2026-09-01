# KAJI

Web app untuk tutor matematika independen mengelola siswa dan mendapat rekomendasi materi belajar berbasis rule-based scoring.

## Tech Stack

- **Frontend**: React 19 + Vite, plain CSS per komponen (tidak pakai framework CSS)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (hosted di [Neon](https://neon.tech)) via [Prisma ORM](https://www.prisma.io)
- **Auth**: JWT (`jsonwebtoken`) + password hashing (`bcryptjs`)

## Struktur Folder

```
kaji-app/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # definisi semua tabel database
│   │   ├── migrations/        # riwayat perubahan schema
│   │   └── seed.js            # isi 5 data Bab awal
│   ├── src/
│   │   ├── config/            # koneksi Prisma client + konstanta (tanggal SNBT, dll)
│   │   ├── middleware/        # requireAuth (verifikasi JWT)
│   │   ├── controllers/       # logic tiap endpoint (auth, siswa, bab, jadwal, rekomendasi, dashboard)
│   │   ├── routes/            # pemetaan URL -> controller
│   │   └── services/          # recommendation.service.js — otak dari rule-based engine
│   └── server.js              # entry point Express
└── frontend/
    └── src/
        ├── api/client.js      # wrapper fetch() + auto-attach JWT token
        ├── context/           # AuthContext (state login global)
        ├── layout/             # Sidebar, Header, AppLayout (shell tiap halaman)
        ├── pages/              # Dashboard, Student, Calendar, Material, Settings, Login
        ├── components/         # potongan UI yang dipakai berkali-kali (modal, card, dll)
        └── constants/          # daftar icon topik yang dipakai di beberapa halaman
```

## Cara Menjalankan

**Backend** (butuh `DATABASE_URL` Neon Postgres di `backend/.env`):
```bash
cd backend
npm install
npx prisma migrate dev   # sinkronkan schema ke database
node prisma/seed.js      # isi 5 Bab awal
node server.js           # jalan di http://localhost:3001
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev               # jalan di http://localhost:5173, otomatis proxy /api ke backend
```

## Konsep Kunci untuk Dipelajari

- **Recommendation engine** (`backend/src/services/recommendation.service.js`): implementasi formula
  `Skor Prioritas = (100 - Skor Bab) x Faktor Urgensi x Faktor Prasyarat`, dihitung ulang setiap kali
  diakses (bukan disimpan statis), supaya selalu ikut skor terbaru siswa.
- **Auth flow**: `backend/src/controllers/auth.controller.js` (register/login/update pakai
  username ATAU email) + `frontend/src/context/AuthContext.jsx` (simpan token di `localStorage`,
  auto-attach ke tiap request lewat `frontend/src/api/client.js`).
- **Ownership check**: hampir semua endpoint siswa di `siswa.controller.js` memverifikasi
  `id_tutor` yang login sama dengan pemilik data sebelum mengizinkan akses — pola ini berulang di
  banyak controller.
- **Shared design tokens**: semua warna/radius didefinisikan sekali di `frontend/src/index.css`
  sebagai CSS variable (`--color-primary`, dst), dipakai di seluruh komponen.
