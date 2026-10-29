-- Lead tablosuna tam form yanıtları (JSON) ve araştırma kuyruk durumu alanı ekle
ALTER TABLE "Lead" ADD COLUMN "formYanitlari" JSONB;
ALTER TABLE "Lead" ADD COLUMN "arastirmaDurumu" TEXT NOT NULL DEFAULT 'bekliyor';
