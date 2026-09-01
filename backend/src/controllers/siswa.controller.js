import prisma from '../config/db.js'

async function assertOwnership(id_siswa, id_tutor) {
  const siswa = await prisma.siswa.findUnique({ where: { id_siswa } })
  if (!siswa || siswa.id_tutor !== id_tutor) return null
  return siswa
}

export async function list(req, res) {
  const siswa = await prisma.siswa.findMany({
    where: { id_tutor: req.tutor.id_tutor },
    include: { _count: { select: { jadwal: true } } },
    orderBy: { nama: 'asc' },
  })
  res.json(
    siswa.map(({ _count, ...s }) => ({ ...s, jumlah_pertemuan: _count.jadwal })),
  )
}

export async function detail(req, res) {
  const siswa = await assertOwnership(req.params.id, req.tutor.id_tutor)
  if (!siswa) return res.status(404).json({ message: 'Siswa tidak ditemukan' })

  const [babList, progresList, jadwal] = await Promise.all([
    prisma.bab.findMany({ orderBy: { urutan_bab: 'asc' } }),
    prisma.progres_Siswa.findMany({ where: { id_siswa: siswa.id_siswa } }),
    prisma.jadwal_Pertemuan.findMany({
      where: { id_siswa: siswa.id_siswa },
      include: { bab: true },
      orderBy: { tanggal_pertemuan: 'desc' },
    }),
  ])

  const skorByBabId = new Map(progresList.map((p) => [p.id_bab, p.skor_bab]))
  const progres = babList.map((bab) => ({
    id_bab: bab.id_bab,
    urutan_bab: bab.urutan_bab,
    nama_bab: bab.nama_bab,
    skor_bab: skorByBabId.has(bab.id_bab) ? skorByBabId.get(bab.id_bab) : null,
  }))

  res.json({ ...siswa, progres, jadwal })
}

export async function create(req, res) {
  const { nama, jenjang, asal_sekolah, universitas_tujuan, email, no_hp, jurusan, sisa_sesi } = req.body
  if (!nama || !jenjang) {
    return res.status(400).json({ message: 'nama dan jenjang wajib diisi' })
  }

  const siswa = await prisma.siswa.create({
    data: {
      nama,
      jenjang,
      asal_sekolah: asal_sekolah ?? '',
      universitas_tujuan: universitas_tujuan ?? '',
      email: email ?? null,
      no_hp: no_hp ?? null,
      jurusan: jurusan ?? null,
      sisa_sesi: typeof sisa_sesi === 'number' ? sisa_sesi : 0,
      id_tutor: req.tutor.id_tutor,
    },
  })
  res.status(201).json(siswa)
}

export async function update(req, res) {
  const siswa = await assertOwnership(req.params.id, req.tutor.id_tutor)
  if (!siswa) return res.status(404).json({ message: 'Siswa tidak ditemukan' })

  const { nama, jenjang, asal_sekolah, universitas_tujuan, email, no_hp, jurusan, sisa_sesi } = req.body
  const updated = await prisma.siswa.update({
    where: { id_siswa: siswa.id_siswa },
    data: { nama, jenjang, asal_sekolah, universitas_tujuan, email, no_hp, jurusan, sisa_sesi },
  })
  res.json(updated)
}

export async function remove(req, res) {
  const siswa = await assertOwnership(req.params.id, req.tutor.id_tutor)
  if (!siswa) return res.status(404).json({ message: 'Siswa tidak ditemukan' })

  await prisma.siswa.delete({ where: { id_siswa: siswa.id_siswa } })
  res.status(204).send()
}

export async function getProgres(req, res) {
  const siswa = await assertOwnership(req.params.id, req.tutor.id_tutor)
  if (!siswa) return res.status(404).json({ message: 'Siswa tidak ditemukan' })

  const progres = await prisma.progres_Siswa.findMany({
    where: { id_siswa: siswa.id_siswa },
    include: { bab: true },
    orderBy: { bab: { urutan_bab: 'asc' } },
  })
  res.json(progres)
}

export async function upsertProgres(req, res) {
  const siswa = await assertOwnership(req.params.id, req.tutor.id_tutor)
  if (!siswa) return res.status(404).json({ message: 'Siswa tidak ditemukan' })

  const id_bab = Number(req.params.id_bab)
  const { skor_bab } = req.body
  if (typeof skor_bab !== 'number' || skor_bab < 0 || skor_bab > 100) {
    return res.status(400).json({ message: 'skor_bab harus angka 0-100' })
  }

  const progres = await prisma.progres_Siswa.upsert({
    where: { id_siswa_id_bab: { id_siswa: siswa.id_siswa, id_bab } },
    update: { skor_bab },
    create: { id_siswa: siswa.id_siswa, id_bab, skor_bab },
  })
  res.json(progres)
}

export { assertOwnership }
