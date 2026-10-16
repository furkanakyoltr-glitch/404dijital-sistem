-- CreateTable
CREATE TABLE "WASablon" (
    "id" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "kategori" TEXT NOT NULL DEFAULT 'Genel',
    "metaTemplateName" TEXT NOT NULL,
    "parametreler" TEXT NOT NULL DEFAULT '[]',
    "onizlemeMetni" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WASablon_pkey" PRIMARY KEY ("id")
);
