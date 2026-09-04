import './src/config/env.js'

import express from 'express'
import cors from 'cors'

import authRoutes from './src/routes/auth.routes.js'
import siswaRoutes from './src/routes/siswa.routes.js'
import babRoutes from './src/routes/bab.routes.js'
import dashboardRoutes from './src/routes/dashboard.routes.js'
import configRoutes from './src/routes/config.routes.js'
import jadwalRoutes from './src/routes/jadwal.routes.js'
import filesRoutes from './src/routes/files.routes.js'

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection (server tetap jalan):', err)
})

const app = express()
const port = process.env.PORT || 3001

// FRONTEND_URL boleh diisi beberapa origin dipisah koma (mis. domain production +
// http://localhost:5173 untuk dev). *.vercel.app otomatis diizinkan juga supaya
// preview deployment Vercel (subdomain acak tiap deploy) tidak perlu didaftarkan manual.
const allowedOrigins = process.env.FRONTEND_URL?.split(',').map((origin) => origin.trim())

function corsOrigin(origin, callback) {
  if (!origin || !allowedOrigins) return callback(null, true)
  const allowed = allowedOrigins.includes(origin) || /^https:\/\/[\w-]+\.vercel\.app$/.test(origin)
  callback(null, allowed)
}

app.use(cors({ origin: corsOrigin }))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' })
})

app.use('/api', filesRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/siswa', siswaRoutes)
app.use('/api/bab', babRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/config', configRoutes)
app.use('/api/jadwal', jadwalRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: 'Terjadi kesalahan pada server' })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend running on port ${port}`)
})
