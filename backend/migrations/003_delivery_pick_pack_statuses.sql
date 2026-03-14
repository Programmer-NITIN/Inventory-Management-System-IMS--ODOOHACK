-- ============================================
-- Migration: Add picked/packed statuses to deliveries
-- ============================================
-- Drop the existing check constraint and add a new one with picked/packed
ALTER TABLE deliveries DROP CONSTRAINT IF EXISTS deliveries_status_check;
ALTER TABLE deliveries ADD CONSTRAINT deliveries_status_check
  CHECK (status IN ('draft','picked','packed','waiting','ready','done','cancelled'));
