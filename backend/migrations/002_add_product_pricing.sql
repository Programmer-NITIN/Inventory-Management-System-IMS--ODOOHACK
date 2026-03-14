-- ============================================
-- Migration: Add cost and price columns to products
-- ============================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost NUMERIC(12,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS price NUMERIC(12,2);
