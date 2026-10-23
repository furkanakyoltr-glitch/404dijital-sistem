-- AlterTable
ALTER TABLE "Admin" ADD COLUMN "departman" TEXT NOT NULL DEFAULT 'yonetim';

-- CreateTable
CREATE TABLE "Pano" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "departman" TEXT NOT NULL,
    "olusturanId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pano_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gorev" (
    "id" TEXT NOT NULL,
    "panoId" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "aciklama" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'yapilacak',
    "oncelik" TEXT NOT NULL DEFAULT 'normal',
    "musteriId" TEXT,
    "atananId" TEXT,
    "olusturanId" TEXT,
    "sonTarih" TIMESTAMP(3),
    "etiket" TEXT,
    "yorumlar" JSONB,
    "dosyalar" JSONB,
    "sira" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gorev_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Pano" ADD CONSTRAINT "Pano_olusturanId_fkey" FOREIGN KEY ("olusturanId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gorev" ADD CONSTRAINT "Gorev_panoId_fkey" FOREIGN KEY ("panoId") REFERENCES "Pano"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gorev" ADD CONSTRAINT "Gorev_musteriId_fkey" FOREIGN KEY ("musteriId") REFERENCES "Musteri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gorev" ADD CONSTRAINT "Gorev_atananId_fkey" FOREIGN KEY ("atananId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gorev" ADD CONSTRAINT "Gorev_olusturanId_fkey" FOREIGN KEY ("olusturanId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
