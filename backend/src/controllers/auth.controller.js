import bcrypt from 'bcryptjs'
import prisma from '../config/db.js'
import { signToken } from '../utils/jwt.js'

const PUBLIC_FIELDS = {
  id_tutor: true,
  nama: true,
  email: true,
  username: true,
  display_name: true,
  no_hp: true,
  gender: true,
}

export async function register(req, res) {
  const { nama, email, kata_sandi, username, display_name, no_hp, gender } = req.body
  if (!nama || !email || !kata_sandi || !username) {
    return res.status(400).json({ message: 'nama, username, email, dan kata_sandi wajib diisi' })
  }

  const existing = await prisma.tutor.findFirst({ where: { OR: [{ email }, { username }] } })
  if (existing) {
    return res.status(409).json({ message: 'Email atau username sudah terdaftar' })
  }

  const hash = await bcrypt.hash(kata_sandi, 10)
  const tutor = await prisma.tutor.create({
    data: { nama, email, kata_sandi: hash, username, display_name, no_hp, gender },
  })

  const token = signToken({ id_tutor: tutor.id_tutor })
  res.status(201).json({
    token,
    tutor: {
      id_tutor: tutor.id_tutor,
      nama: tutor.nama,
      email: tutor.email,
      username: tutor.username,
    },
  })
}

export async function login(req, res) {
  const { identifier, kata_sandi } = req.body
  if (!identifier || !kata_sandi) {
    return res.status(400).json({ message: 'username/email dan kata_sandi wajib diisi' })
  }

  const tutor = await prisma.tutor.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] },
  })
  if (!tutor) {
    return res.status(401).json({ message: 'Username/email atau kata sandi salah' })
  }

  const valid = await bcrypt.compare(kata_sandi, tutor.kata_sandi)
  if (!valid) {
    return res.status(401).json({ message: 'Username/email atau kata sandi salah' })
  }

  const token = signToken({ id_tutor: tutor.id_tutor })
  res.json({
    token,
    tutor: {
      id_tutor: tutor.id_tutor,
      nama: tutor.nama,
      email: tutor.email,
      username: tutor.username,
    },
  })
}

export async function me(req, res) {
  const tutor = await prisma.tutor.findUnique({
    where: { id_tutor: req.tutor.id_tutor },
    select: PUBLIC_FIELDS,
  })
  res.json(tutor)
}

export async function updateMe(req, res) {
  const { nama, email, username, display_name, no_hp, gender, kata_sandi } = req.body

  if (username || email) {
    const conflict = await prisma.tutor.findFirst({
      where: {
        id_tutor: { not: req.tutor.id_tutor },
        OR: [...(email ? [{ email }] : []), ...(username ? [{ username }] : [])],
      },
    })
    if (conflict) {
      return res.status(409).json({ message: 'Email atau username sudah dipakai tutor lain' })
    }
  }

  const data = { nama, email, username, display_name, no_hp, gender }
  if (kata_sandi) {
    data.kata_sandi = await bcrypt.hash(kata_sandi, 10)
  }

  const tutor = await prisma.tutor.update({
    where: { id_tutor: req.tutor.id_tutor },
    data,
    select: PUBLIC_FIELDS,
  })
  res.json(tutor)
}
