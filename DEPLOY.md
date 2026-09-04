# Panduan Deploy KAJI (Render + Vercel + Domain sistemkaji.com)

Domain: **sistemkaji.com** (dibeli di Rumah Web)

## Arsitektur

```
sistemkaji.com          -> Vercel (frontend, React + Vite)
api.sistemkaji.com      -> Render (backend, Express + Prisma)
                            -> Neon Postgres (database)
```

Backend dan frontend di-deploy terpisah. Domain utama dipakai untuk frontend,
subdomain `api.` dipakai untuk backend supaya URL API rapi dan tidak terikat
ke `*.onrender.com`.

---

## 0. Prasyarat

- [ ] Semua perubahan sudah di-commit
- [ ] Repo sudah punya remote GitHub (`git remote -v` tidak kosong)
- [ ] Sudah login ke [render.com](https://render.com) dan [vercel.com](https://vercel.com) (bisa pakai akun GitHub)
- [ ] Akses ke panel domain Rumah Web (untuk atur DNS)

```bash
git add -A
git commit -m "chore: siap deploy"
git push -u origin main
```

---

## 1. Deploy Backend ke Render

1. Render Dashboard → **New** → **Web Service** → connect ke repo GitHub ini.
2. Isi konfigurasi:
   | Setting | Nilai |
   |---|---|
   | Root Directory | `backend` |
   | Runtime | Node |
   | Build Command | `npm install && npx prisma migrate deploy` |
   | Start Command | `npm start` |
   | Instance Type | Free / sesuai kebutuhan |

3. Tambahkan Environment Variables (Render → tab **Environment**):
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | connection string Neon Postgres (sama seperti di `backend/.env`) |
   | `JWT_SECRET` | string acak panjang (boleh reuse yang di `.env`, atau generate baru khusus production) |
   | `FRONTEND_URL` | `https://sistemkaji.com` (nanti bisa ditambah `,https://www.sistemkaji.com` — pisahkan koma) |
   | `PORT` | tidak perlu diisi, Render set otomatis |

4. Deploy. Tunggu build selesai, lalu cek `https://<nama-service>.onrender.com/api/health` harus balas `{"status":"ok"}`.

### 1a. Sambungkan `api.sistemkaji.com` ke Render

1. Di service Render → tab **Settings** → **Custom Domains** → **Add Custom Domain** → masukkan `api.sistemkaji.com`.
2. Render akan menampilkan target CNAME, biasanya berupa `<nama-service>.onrender.com`. Catat nilai persisnya dari dashboard (bisa berbeda-beda).
3. Buka panel DNS Rumah Web untuk domain `sistemkaji.com` (biasanya di menu **DNS Management** / **Zone Editor** di cPanel/CloudLinux Rumah Web) dan tambahkan record:
   | Type | Host/Name | Value/Target |
   |---|---|---|
   | CNAME | `api` | `<nama-service>.onrender.com` (dari Render) |
4. Tunggu propagasi DNS (bisa 5 menit – beberapa jam). Render akan otomatis issue SSL certificate begitu DNS terverifikasi — status di dashboard berubah jadi "Verified".

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

> Catatan: kalau nameserver domain masih default punya Rumah Web, cukup tambah record di Zone Editor mereka — tidak perlu pindah nameserver ke Vercel/Render.

---

## 3. Update Env Vars Setelah Domain Aktif

Setelah `sistemkaji.com` dan `api.sistemkaji.com` sudah live dan SSL aktif:

1. **Render** → update `FRONTEND_URL` jadi `https://sistemkaji.com,https://www.sistemkaji.com` (sertakan semua origin yang dipakai) → redeploy backend.
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

---

## 5. Troubleshooting

| Gejala | Kemungkinan Penyebab | Fix |
|---|---|---|
| CORS error di browser console | `FRONTEND_URL` di Render belum termasuk origin yang dipakai | Tambahkan origin persis (termasuk `https://` dan tanpa trailing slash) ke `FRONTEND_URL`, redeploy |
| Refresh route selain `/` → 404 | `vercel.json` rewrite tidak kepakai / root directory salah | Pastikan `frontend/vercel.json` ada dan Root Directory Vercel = `frontend` |
| Data lama hilang setelah redeploy | Masih pakai `multer.diskStorage` / folder `uploads` lokal | Pastikan migrasi `file_storage_in_db` sudah jalan (`prisma migrate deploy`) di production |
| Login gagal padahal kredensial benar | `JWT_SECRET` beda antara saat token dibuat vs sekarang (misal habis redeploy dengan secret baru) | Set `JWT_SECRET` sekali di awal dan jangan diubah-ubah tanpa alasan |
| Domain belum aktif setelah 24 jam | Record DNS salah / masih di-cache | Cek dengan `nslookup sistemkaji.com` dan `nslookup api.sistemkaji.com`, bandingkan dengan target yang diminta Vercel/Render |
| Perubahan `VITE_API_URL` tidak ke-apply | Vite inject env var saat **build**, bukan saat runtime | Redeploy ulang project di Vercel setelah ubah env var |
