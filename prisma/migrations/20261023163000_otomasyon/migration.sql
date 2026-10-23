-- CreateTable
CREATE TABLE "Otomasyon" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "tetikleyici" TEXT NOT NULL,
    "departman" TEXT NOT NULL DEFAULT 'tumu',
    "mesaj" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "sonCalisma" TIMESTAMP(3),
    "calismaSayisi" INTEGER NOT NULL DEFAULT 0,
    "olusturanId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Otomasyon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtomasyonLog" (
    "id" TEXT NOT NULL,
    "otomasyonId" TEXT NOT NULL,
    "otomasyonAdi" TEXT NOT NULL,
    "hedefTelefon" TEXT,
    "mesaj" TEXT NOT NULL,
    "basarili" BOOLEAN NOT NULL,
    "hata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtomasyonLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Otomasyon" ADD CONSTRAINT "Otomasyon_olusturanId_fkey" FOREIGN KEY ("olusturanId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
