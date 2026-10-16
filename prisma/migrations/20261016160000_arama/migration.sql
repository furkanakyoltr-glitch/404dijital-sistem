-- CreateTable
CREATE TABLE "Arama" (
    "id" TEXT NOT NULL,
    "callSid" TEXT NOT NULL,
    "kimden" TEXT NOT NULL,
    "kime" TEXT NOT NULL,
    "marka" TEXT NOT NULL DEFAULT 'Spok.mp4',
    "durum" TEXT NOT NULL DEFAULT 'basladi',
    "sureSaniye" INTEGER,
    "kayitUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Arama_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Arama_callSid_key" ON "Arama"("callSid");
