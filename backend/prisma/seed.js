import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const BAB_LIST = [
  {
    urutan_bab: 1,
    nama_bab: 'Operasi Bilangan',
    ringkasan:
      'Membahas penjumlahan, pengurangan, perkalian, dan pembagian pada bilangan bulat, pecahan, dan desimal, termasuk urutan operasi dan sifat-sifatnya (komutatif, asosiatif, distributif).',
  },
  {
    urutan_bab: 2,
    nama_bab: 'Eksponen dan Logaritma',
    ringkasan:
      'Membahas sifat-sifat bilangan berpangkat (eksponen), bentuk akar, serta hubungannya dengan logaritma, termasuk persamaan dan pertidaksamaan eksponen/logaritma.',
  },
  {
    urutan_bab: 3,
    nama_bab: 'Fungsi dan Persamaan Kuadrat',
    ringkasan:
      'Membahas konsep fungsi (linear, kuadrat), cara menentukan akar-akar persamaan, serta hubungan grafik fungsi dengan penyelesaian persamaan dan pertidaksamaan.',
  },
  {
    urutan_bab: 4,
    nama_bab: 'SPLDV',
    ringkasan:
      'Membahas Sistem Persamaan Linear Dua Variabel: metode substitusi, eliminasi, dan grafik untuk mencari penyelesaian dari dua persamaan linear yang saling berkaitan.',
  },
  {
    urutan_bab: 5,
    nama_bab: 'Bangun Datar',
    ringkasan:
      'Membahas sifat, keliling, dan luas berbagai bangun datar (segitiga, segiempat, lingkaran), serta penerapannya dalam soal-soal geometri.',
  },
  {
    urutan_bab: 6,
    nama_bab: 'Trigonometri Dasar',
    ringkasan:
      'Membahas fungsi trigonometri dasar (sin, cos, tan), identitas trigonometri, serta penerapannya pada segitiga siku-siku dan lingkaran satuan.',
  },
  {
    urutan_bab: 7,
    nama_bab: 'Dimensi Tiga',
    ringkasan:
      'Membahas jarak dan sudut antar titik, garis, dan bidang dalam ruang, serta perhitungan volume dan luas permukaan bangun ruang.',
  },
  {
    urutan_bab: 8,
    nama_bab: 'Barisan dan Deret',
    ringkasan:
      'Membahas barisan dan deret aritmetika serta geometri, termasuk rumus suku ke-n dan jumlah n suku pertama.',
  },
  {
    urutan_bab: 9,
    nama_bab: 'Statistika dan Penyajian Data',
    ringkasan:
      'Membahas ukuran pemusatan (mean, median, modus), ukuran penyebaran data, serta cara membaca dan menyajikan data dalam tabel/grafik.',
  },
  {
    urutan_bab: 10,
    nama_bab: 'Peluang',
    ringkasan:
      'Membahas kaidah pencacahan (permutasi, kombinasi) serta peluang kejadian tunggal dan majemuk.',
  },
  {
    urutan_bab: 11,
    nama_bab: 'Aritmatika Sosial',
    ringkasan:
      'Membahas perhitungan untung-rugi, bunga tunggal/majemuk, diskon, pajak, dan bruto-neto-tara dalam konteks ekonomi sehari-hari.',
  },
  {
    urutan_bab: 12,
    nama_bab: 'Matriks dan Transformasi',
    ringkasan:
      'Membahas operasi matriks (penjumlahan, perkalian, invers) serta transformasi geometri (translasi, refleksi, rotasi, dilatasi).',
  },
  {
    urutan_bab: 13,
    nama_bab: 'Limit dan Turunan Dasar',
    ringkasan:
      'Membahas konsep limit fungsi dan turunan sebagai laju perubahan, termasuk aturan-aturan dasar turunan.',
  },
]

async function main() {
  for (const bab of BAB_LIST) {
    await prisma.bab.upsert({
      where: { urutan_bab: bab.urutan_bab },
      update: { nama_bab: bab.nama_bab, ringkasan: bab.ringkasan },
      create: bab,
    })
  }
  console.log(`Seed selesai: ${BAB_LIST.length} bab tersedia.`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
