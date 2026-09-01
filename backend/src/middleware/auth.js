import { verifyToken } from '../utils/jwt.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token tidak ditemukan' })
  }

  try {
    const payload = verifyToken(header.slice('Bearer '.length))
    req.tutor = { id_tutor: payload.id_tutor }
    next()
  } catch {
    res.status(401).json({ message: 'Token tidak valid atau kedaluwarsa' })
  }
}
