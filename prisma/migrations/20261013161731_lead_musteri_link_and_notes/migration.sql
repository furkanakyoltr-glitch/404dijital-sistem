-- Link Lead to Musteri (1:1, nullable) and add LeadNot for timestamped follow-up history

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "musteriId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Lead_musteriId_key" ON "Lead"("musteriId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_musteriId_fkey" FOREIGN KEY ("musteriId") REFERENCES "Musteri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "LeadNot" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "icerik" TEXT NOT NULL,
    "olusturanId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadNot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LeadNot" ADD CONSTRAINT "LeadNot_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNot" ADD CONSTRAINT "LeadNot_olusturanId_fkey" FOREIGN KEY ("olusturanId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
