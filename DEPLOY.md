# Panduan Deploy KAJI (Railway + Vercel + Domain sistemkaji.com)

Domain: **sistemkaji.com** (dibeli di Rumah Web)

## Arsitektur

```
sistemkaji.com          -> Vercel (frontend, React + Vite)
api.sistemkaji.com      -> Railway (backend, Express + Prisma)
                            -> Neon Postgres (database)
```

Backend dan frontend di-deploy terpisah. Domain utama dipakai untuk frontend,
subdomain `api.` dipakai untuk backend supaya URL API rapi dan tidak terikat
ke `*.up.railway.app`.

---

## 0. Prasyarat

- [ ] Semua perubahan sudah di-commit
- [ ] Repo sudah punya remote GitHub (`git remote -v` tidak kosong)
- [ ] Sudah login ke [railway.app](https://railway.app) dan [vercel.com](https://vercel.com) (bisa pakai akun GitHub)
- [ ] Railway butuh kartu pembayaran terpasang di akun (Trial plan gratis punya kredit terbatas dan tidak bisa pasang custom domain kalau kreditnya habis) — set ke plan **Hobby** ($5/bulan usage-based) sebelum lanjut
- [ ] Akses ke panel domain Rumah Web (untuk atur DNS)

```bash
git add -A
git commit -m "chore: siap deploy"
git push -u origin main
```

---

## 0a. Setup Nameserver & DNS di Rumah Web

**Nameserver domain `sistemkaji.com` tetap pakai default Rumah Web** (biasanya
`ns1.rumahweb.com` / `ns2.rumahweb.com`, cek nama persisnya di member area
kamu) — **jangan** diganti ke nameserver Vercel atau Railway.

Alasannya: Vercel dan Railway mendukung koneksi domain lewat DNS record biasa
(A/CNAME), jadi cukup nambah record di Zone Editor Rumah Web. Kalau nameserver
dipindah ke Vercel, subdomain `api.sistemkaji.com` yang menunjuk ke Railway
jadi tidak bisa diatur dari sana — lebih ribet. Dengan nameserver tetap di
Rumah Web, apex domain (ke Vercel) dan subdomain `api.` (ke Railway) bisa
dikelola dari satu tempat.

**Cara buka DNS Zone Editor di Rumah Web:**

1. Login ke [member area Rumah Web](https://my.rumahweb.com) (atau cPanel,
   tergantung jenis layanan hosting/domain kamu).
2. Cari menu **Domain** → pilih `sistemkaji.com` → **DNS Management** /
   **Zone Editor** / **Kelola DNS Record** (nama menunya bisa beda tergantung
   panel yang dipakai).
3. Pastikan **Nameserver** domain masih default Rumah Web (tab terpisah dari
   DNS Management, biasanya di tab **Nameserver** — cukup dicek, tidak perlu
   diubah).
4. Di Zone Editor, tambahkan record berikut (nilai persis untuk Vercel/Railway
   dilihat lagi dari dashboard masing-masing saat kamu add custom domain,
   lihat langkah 1a dan 2a):

   | Type | Host/Name | Value/Target | Untuk |
   |---|---|---|---|
   | A | `@` | `76.76.21.21` | Frontend (Vercel apex) |
   | CNAME | `www` | `cname.vercel-dns.com` | Frontend (opsional, kalau pakai www) |
   | CNAME | `api` | `<target-yang-diberikan-railway>` | Backend (Railway, lihat 1a) |

5. Simpan. Propagasi DNS biasanya 5 menit – beberapa jam (kadang sampai 24
   jam). Cek status dengan:
   ```bash
   nslookup sistemkaji.com
   nslookup api.sistemkaji.com
   ```
   Bandingkan hasilnya dengan target yang diminta Vercel/Railway di dashboard.

---

## 1. Deploy Backend ke Railway

1. Railway Dashboard → **New Project** → **Deploy from GitHub repo** → pilih repo ini.
2. Railway otomatis mendeteksi Node lewat Nixpacks. Karena repo ini monorepo
   (backend + frontend jadi satu repo), atur root directory service:
   - Buka service yang baru dibuat → tab **Settings** → **Source** →
     **Root Directory** → isi `backend`.
3. Build & start command **tidak perlu diisi manual** — Railway otomatis
   jalankan `npm install` (yang juga trigger `prisma generate` lewat
   `postinstall`) lalu `npm start`. Script `start` di `backend/package.json`
   sudah mencakup `prisma migrate deploy` sebelum server jalan, jadi migrasi
   database ikut jalan otomatis tiap deploy.
4. Tambahkan Environment Variables (service → tab **Variables**):
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | connection string Neon Postgres (sama seperti di `backend/.env`) |
   | `JWT_SECRET` | string acak panjang (boleh reuse yang di `.env`, atau generate baru khusus production) |
   | `FRONTEND_URL` | `https://sistemkaji.com` (nanti bisa ditambah `,https://www.sistemkaji.com` — pisahkan koma) |

   > Jangan set `PORT` manual — Railway inject otomatis, dan `server.js` sudah
   > baca `process.env.PORT` serta bind ke `0.0.0.0` (wajib supaya Railway bisa
   > mengarahkan traffic ke container).
5. Railway otomatis deploy setelah variable disimpan. Setelah build selesai,
   cek domain publik sementara (**Settings → Networking → Generate Domain**,
   bentuknya `<nama>.up.railway.app`) lalu tes
   `https://<nama>.up.railway.app/api/health` harus balas `{"status":"ok"}`.

### 1a. Sambungkan `api.sistemkaji.com` ke Railway

1. Di service Railway → tab **Settings → Networking → Custom Domain** →
   masukkan `api.sistemkaji.com` → **Add Domain**.
2. Railway akan menampilkan target CNAME unik (bukan `up.railway.app` biasa,
   tapi subdomain khusus untuk domain ini). Catat nilai persisnya dari
   dashboard.
3. Buka panel DNS Rumah Web untuk domain `sistemkaji.com` dan tambahkan record:
   | Type | Host/Name | Value/Target |
   |---|---|---|
   | CNAME | `api` | `<target-dari-railway>` (dari langkah 2) |
4. Tunggu propagasi DNS (bisa 5 menit – beberapa jam). Railway akan otomatis
   issue SSL certificate begitu DNS terverifikasi — status di dashboard
   berubah jadi "Active"/centang hijau.

---

## 2. Deploy Frontend ke Vercel

1. Vercel Dashboard → **Add New** → **Project** → import repo GitHub yang sama.
2. Isi konfigurasi:
   | Setting | Nilai |
   |---|---|
   | Root Directory | `frontend` |
   | Framework Preset | Vite (auto-detect) |
   | Build Command | `npm run build` (default) |
   | Output Directory | `dist` (default) |

3. Tambahkan Environment Variable (Vercel → **Settings → Environment Variables**, scope **Production** + **Preview**):
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://api.sistemkaji.com` |

   > `frontend/vercel.json` sudah berisi rewrite rule supaya route React Router
   > (`/student`, `/calendar`, dst) tidak 404 saat direfresh langsung.

4. Deploy. Cek preview URL (`https://<project>.vercel.app`) dulu — pastikan login & fetch API jalan sebelum atur domain custom.

### 2a. Sambungkan `sistemkaji.com` ke Vercel

1. Project Vercel → tab **Settings → Domains** → masukkan `sistemkaji.com` → **Add**.
2. Vercel akan minta salah satu dari dua opsi (tampil di dashboard, ikuti yang ditampilkan Vercel karena bisa berubah):
   - **Opsi A – Apex domain via A record:**
     | Type | Host/Name | Value |
     |---|---|---|
     | A | `@` | `76.76.21.21` |
   - **Opsi B – pakai `www` sebagai domain utama:**
     | Type | Host/Name | Value |
     |---|---|---|
     | CNAME | `www` | `cname.vercel-dns.com` |
     (lalu redirect `sistemkaji.com` → `www.sistemkaji.com` di setting Vercel)
3. Tambahkan juga `www.sistemkaji.com` di Vercel dan pilih redirect ke apex (atau sebaliknya), sesuai preferensi.
4. Di panel DNS Rumah Web, tambahkan record sesuai yang diminta Vercel di langkah 2.
5. Tunggu propagasi DNS, Vercel otomatis provision SSL (Let's Encrypt) begitu DNS terverifikasi.

> Catatan: kalau nameserver domain masih default punya Rumah Web, cukup tambah record di Zone Editor mereka — tidak perlu pindah nameserver ke Vercel/Railway.

---

## 3. Update Env Vars Setelah Domain Aktif

Setelah `sistemkaji.com` dan `api.sistemkaji.com` sudah live dan SSL aktif:

1. **Railway** → update `FRONTEND_URL` jadi `https://sistemkaji.com,https://www.sistemkaji.com` (sertakan semua origin yang dipakai) → Railway otomatis redeploy saat variable disimpan.
2. **Vercel** → pastikan `VITE_API_URL=https://api.sistemkaji.com` sudah benar → redeploy frontend (Vercel perlu rebuild karena `VITE_API_URL` di-inject saat build, bukan runtime).

---

## 4. Checklist Verifikasi Akhir

- [ ] `https://api.sistemkaji.com/api/health` → `{"status":"ok"}`
- [ ] `https://sistemkaji.com` load, redirect ke `/login` kalau belum auth
- [ ] Register/login tutor berhasil (cek tidak ada error CORS di console browser)
- [ ] Refresh halaman di route selain `/` (mis. `/student`) — tidak 404
- [ ] Upload foto profil siswa berhasil, foto tampil (cek endpoint `/api/siswa/:id/foto`)
- [ ] Upload assignment PDF berhasil, bisa dibuka lagi
- [ ] Data yang dibuat nge-persist setelah backend redeploy (bukti file disimpan di Postgres, bukan disk)
- [ ] Lihat log deploy Railway sekali — pastikan baris `prisma migrate deploy` sukses jalan tanpa error sebelum "Backend running on port ..."

---

## 5. Troubleshooting

| Gejala | Kemungkinan Penyebab | Fix |
|---|---|---|
| CORS error di browser console | `FRONTEND_URL` di Railway belum termasuk origin yang dipakai | Tambahkan origin persis (termasuk `https://` dan tanpa trailing slash) ke `FRONTEND_URL` di tab Variables |
| Refresh route selain `/` → 404 | `vercel.json` rewrite tidak kepakai / root directory salah | Pastikan `frontend/vercel.json` ada dan Root Directory Vercel = `frontend` |
| Data lama hilang setelah redeploy | Masih pakai `multer.diskStorage` / folder `uploads` lokal | Pastikan migrasi `file_storage_in_db` sudah jalan (`prisma migrate deploy`, otomatis lewat script `start`) di production |
| Login gagal padahal kredensial benar | `JWT_SECRET` beda antara saat token dibuat vs sekarang (misal habis redeploy dengan secret baru) | Set `JWT_SECRET` sekali di awal dan jangan diubah-ubah tanpa alasan |
| Deploy Railway gagal / restart loop | Root Directory service belum diset ke `backend`, atau `DATABASE_URL` salah/belum diisi | Cek tab **Deployments → Logs**; pastikan Root Directory = `backend` dan semua env var di langkah 1 terisi |
| Domain belum aktif setelah 24 jam | Record DNS salah / masih di-cache | Cek dengan `nslookup sistemkaji.com` dan `nslookup api.sistemkaji.com`, bandingkan dengan target yang diminta Vercel/Railway |
| Perubahan `VITE_API_URL` tidak ke-apply | Vite inject env var saat **build**, bukan saat runtime | Redeploy ulang project di Vercel setelah ubah env var |
