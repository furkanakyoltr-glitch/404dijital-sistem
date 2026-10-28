-- CreateTable
CREATE TABLE "SosyalMedyaHesap" (
    "id" TEXT NOT NULL,
    "musteriId" TEXT,
    "adlandirma" TEXT NOT NULL,
    "sayfaId" TEXT NOT NULL,
    "igHesapId" TEXT,
    "erisimTokeni" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SosyalMedyaHesap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SosyalMedyaGonderi" (
    "id" TEXT NOT NULL,
    "hesapId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "tip" TEXT NOT NULL,
    "medyaUrl" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "planlananTarih" TIMESTAMP(3) NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'bekliyor',
    "metaPostId" TEXT,
    "hataMesaji" TEXT,
    "yayinlananTarih" TIMESTAMP(3),
    "olusturanAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SosyalMedyaGonderi_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SosyalMedyaHesap" ADD CONSTRAINT "SosyalMedyaHesap_musteriId_fkey" FOREIGN KEY ("musteriId") REFERENCES "Musteri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SosyalMedyaGonderi" ADD CONSTRAINT "SosyalMedyaGonderi_hesapId_fkey" FOREIGN KEY ("hesapId") REFERENCES "SosyalMedyaHesap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SosyalMedyaGonderi" ADD CONSTRAINT "SosyalMedyaGonderi_olusturanAdminId_fkey" FOREIGN KEY ("olusturanAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
