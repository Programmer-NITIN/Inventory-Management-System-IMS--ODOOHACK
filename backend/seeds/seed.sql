-- ============================================
-- CoreInventory — Seed Data
-- ============================================

-- Categories
INSERT INTO categories (name, description) VALUES
  ('Raw Materials', 'Unprocessed materials used in production'),
  ('Finished Goods', 'Completed products ready for sale'),
  ('Packaging', 'Packaging materials and supplies'),
  ('Spare Parts', 'Replacement parts for machinery'),
  ('Office Supplies', 'Office and administrative supplies')
ON CONFLICT (name) DO NOTHING;

-- Warehouses
INSERT INTO warehouses (name, address) VALUES
  ('Main Warehouse', '123 Industrial Avenue, Block A'),
  ('Secondary Warehouse', '456 Commerce Road, Building 2'),
  ('Distribution Center', '789 Logistics Blvd')
ON CONFLICT (name) DO NOTHING;

-- Locations (for Main Warehouse id=1)
INSERT INTO locations (warehouse_id, name, description) VALUES
  (1, 'Rack A-01', 'Ground floor - Heavy items'),
  (1, 'Rack A-02', 'Ground floor - Medium items'),
  (1, 'Rack B-01', 'First floor - Light items'),
  (1, 'Rack B-02', 'First floor - Packaging zone'),
  (1, 'Cold Storage', 'Temperature controlled area')
ON CONFLICT (warehouse_id, name) DO NOTHING;

-- Locations (for Secondary Warehouse id=2)
INSERT INTO locations (warehouse_id, name, description) VALUES
  (2, 'Bay 1', 'Loading dock area'),
  (2, 'Bay 2', 'Storage area'),
  (2, 'Bay 3', 'Outbound staging')
ON CONFLICT (warehouse_id, name) DO NOTHING;

-- Locations (for Distribution Center id=3)
INSERT INTO locations (warehouse_id, name, description) VALUES
  (3, 'Zone A', 'Inbound receiving'),
  (3, 'Zone B', 'Outbound dispatch')
ON CONFLICT (warehouse_id, name) DO NOTHING;

-- Products
INSERT INTO products (name, sku, category_id, unit, reorder_level, description) VALUES
  ('Steel Rods', 'SKU-STEEL-001', 1, 'kg', 100, 'High-grade steel rods for construction'),
  ('Copper Wire', 'SKU-COPPER-001', 1, 'meters', 200, '2mm copper wire'),
  ('Wooden Chair', 'SKU-CHAIR-001', 2, 'units', 20, 'Oak wood dining chair'),
  ('Office Desk', 'SKU-DESK-001', 2, 'units', 10, 'Adjustable height office desk'),
  ('Cardboard Box Large', 'SKU-BOX-LG-001', 3, 'units', 500, '60x40x40 cm cardboard box'),
  ('Bubble Wrap Roll', 'SKU-BWRAP-001', 3, 'meters', 100, '1m wide bubble wrap'),
  ('Motor Bearing 6205', 'SKU-BRG-6205', 4, 'units', 50, 'Standard ball bearing 6205'),
  ('Printer Paper A4', 'SKU-PAPER-A4', 5, 'reams', 30, '80gsm white A4 paper')
ON CONFLICT (sku) DO NOTHING;

-- Stock (initial quantities)
INSERT INTO stock (product_id, location_id, quantity) VALUES
  (1, 1, 250),
  (2, 2, 500),
  (3, 3, 45),
  (4, 3, 12),
  (5, 4, 800),
  (6, 4, 150),
  (7, 2, 75),
  (8, 3, 60)
ON CONFLICT (product_id, location_id) DO NOTHING;
