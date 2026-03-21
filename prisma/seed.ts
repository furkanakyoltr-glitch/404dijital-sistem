import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create superadmin
  const hashedPassword = await bcrypt.hash('404dijital2026', 10)
  await prisma.admin.upsert({
    where: { email: 'admin@404dijital.com' },
    update: {},
    create: {
      email: 'admin@404dijital.com',
      password: hashedPassword,
      name: 'Furkan',
      role: 'superadmin',
    },
  })

  // Create demo customer
  const demoSifre = await bcrypt.hash('demo1234', 10)
  await prisma.musteri.upsert({
    where: { kasaNo: '404-001' },
    update: {},
    create: {
      firmaAdi: 'Demo Firma A.Ş.',
      yetkiliKisi: 'Demo Kullanıcı',
      telefon: '+90 555 000 00 00',
      email: 'demo@firma.com',
      kasaNo: '404-001',
      sifre: demoSifre,
      durum: 'bekliyor',
    },
  })

  console.log('✅ Seed tamamlandı!')
  console.log('Admin: admin@404dijital.com / 404dijital2026')
  console.log('Demo müşteri: 404-001 / demo1234')
}

main().catch(console.error).finally(() => prisma.$disconnect())
