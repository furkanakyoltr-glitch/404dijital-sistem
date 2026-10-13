-- Add WPSohbet / WPSohbetMesaj for human-operated WhatsApp web inbox

-- CreateTable
CREATE TABLE "WPSohbet" (
    "id" TEXT NOT NULL,
    "telNo" TEXT NOT NULL,
    "isim" TEXT,
    "kaynak" TEXT NOT NULL DEFAULT 'whatsapp',
    "sonMesaj" TEXT,
    "sonMesajZamani" TIMESTAMP(3),
    "okunmadi" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WPSohbet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WPSohbet_telNo_key" ON "WPSohbet"("telNo");

-- CreateTable
CREATE TABLE "WPSohbetMesaj" (
    "id" TEXT NOT NULL,
    "sohbetId" TEXT NOT NULL,
    "yon" TEXT NOT NULL,
    "icerik" TEXT NOT NULL,
    "gonderenAdminId" TEXT,
    "waMesajId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WPSohbetMesaj_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WPSohbetMesaj" ADD CONSTRAINT "WPSohbetMesaj_sohbetId_fkey" FOREIGN KEY ("sohbetId") REFERENCES "WPSohbet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
