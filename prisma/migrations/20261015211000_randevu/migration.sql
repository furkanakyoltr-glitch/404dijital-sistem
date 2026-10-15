-- CreateTable
CREATE TABLE "Randevu" (
    "id" TEXT NOT NULL,
    "tarih" TEXT NOT NULL,
    "saat" TEXT NOT NULL,
    "adaySoyad" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "pozisyon" TEXT NOT NULL DEFAULT 'Satış Yöneticisi',
    "notlar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Randevu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Randevu_tarih_saat_key" ON "Randevu"("tarih", "saat");
