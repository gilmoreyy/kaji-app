import './src/config/env.js'

import express from 'express'
import cors from 'cors'

import authRoutes from './src/routes/auth.routes.js'
import siswaRoutes from './src/routes/siswa.routes.js'
import babRoutes from './src/routes/bab.routes.js'
import dashboardRoutes from './src/routes/dashboard.routes.js'
import configRoutes from './src/routes/config.routes.js'
import jadwalRoutes from './src/routes/jadwal.routes.js'

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection (server tetap jalan):', err)
})

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' })
})

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
