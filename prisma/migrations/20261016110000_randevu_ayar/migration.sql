-- CreateTable
CREATE TABLE "RandevuAyar" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "gunler" TEXT NOT NULL DEFAULT '[]',
    "baslangicSaat" TEXT NOT NULL DEFAULT '09:00',
    "bitisSaat" TEXT NOT NULL DEFAULT '18:00',
    "slotDakika" INTEGER NOT NULL DEFAULT 30,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RandevuAyar_pkey" PRIMARY KEY ("id")
);
