import prisma from '../config/db.js'

export async function list(req, res) {
  const bab = await prisma.bab.findMany({ orderBy: { urutan_bab: 'asc' } })
  res.json(bab)
}
