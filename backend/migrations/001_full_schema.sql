-- ============================================
-- CoreInventory — Full Database Schema
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid    VARCHAR(128) UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    display_name    VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('manager', 'staff')),
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);

-- ============================================
-- 2. CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. PRODUCTS
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    sku             VARCHAR(50) UNIQUE NOT NULL,
    category_id     INT REFERENCES categories(id) ON DELETE SET NULL,
    unit            VARCHAR(30) NOT NULL DEFAULT 'units',
    reorder_level   INT NOT NULL DEFAULT 0,
    description     TEXT,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- ============================================
-- 4. WAREHOUSES
-- ============================================
CREATE TABLE IF NOT EXISTS warehouses (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) UNIQUE NOT NULL,
    address     TEXT,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. LOCATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS locations (
    id              SERIAL PRIMARY KEY,
    warehouse_id    INT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(warehouse_id, name)
);
CREATE INDEX IF NOT EXISTS idx_locations_warehouse ON locations(warehouse_id);

-- ============================================
-- 6. STOCK
-- ============================================
CREATE TABLE IF NOT EXISTS stock (
    id              SERIAL PRIMARY KEY,
    product_id      INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    location_id     INT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    quantity        INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, location_id)
);
CREATE INDEX IF NOT EXISTS idx_stock_product ON stock(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_location ON stock(location_id);

-- ============================================
-- 7. RECEIPTS
-- ============================================
CREATE TABLE IF NOT EXISTS receipts (
    id              SERIAL PRIMARY KEY,
    reference       VARCHAR(50) UNIQUE NOT NULL,
    supplier_name   VARCHAR(255),
    warehouse_id    INT NOT NULL REFERENCES warehouses(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','waiting','ready','done','cancelled')),
    notes           TEXT,
    created_by      UUID REFERENCES users(id),
    validated_by    UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    validated_at    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS receipt_items (
    id              SERIAL PRIMARY KEY,
    receipt_id      INT NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    product_id      INT NOT NULL REFERENCES products(id),
    location_id     INT NOT NULL REFERENCES locations(id),
    quantity        INT NOT NULL CHECK (quantity > 0),
    received_qty    INT DEFAULT 0
);

-- ============================================
-- 8. DELIVERIES
-- ============================================
CREATE TABLE IF NOT EXISTS deliveries (
    id              SERIAL PRIMARY KEY,
    reference       VARCHAR(50) UNIQUE NOT NULL,
    customer_name   VARCHAR(255),
    warehouse_id    INT NOT NULL REFERENCES warehouses(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','waiting','ready','done','cancelled')),
    notes           TEXT,
    created_by      UUID REFERENCES users(id),
    validated_by    UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    validated_at    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS delivery_items (
    id              SERIAL PRIMARY KEY,
    delivery_id     INT NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    product_id      INT NOT NULL REFERENCES products(id),
    location_id     INT NOT NULL REFERENCES locations(id),
    quantity        INT NOT NULL CHECK (quantity > 0),
    picked_qty      INT DEFAULT 0
);

-- ============================================
-- 9. TRANSFERS
-- ============================================
CREATE TABLE IF NOT EXISTS transfers (
    id                  SERIAL PRIMARY KEY,
    reference           VARCHAR(50) UNIQUE NOT NULL,
    source_warehouse_id INT NOT NULL REFERENCES warehouses(id),
    dest_warehouse_id   INT NOT NULL REFERENCES warehouses(id),
    status              VARCHAR(20) NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft','waiting','ready','done','cancelled')),
    notes               TEXT,
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    completed_at        TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS transfer_items (
    id                  SERIAL PRIMARY KEY,
    transfer_id         INT NOT NULL REFERENCES transfers(id) ON DELETE CASCADE,
    product_id          INT NOT NULL REFERENCES products(id),
    source_location_id  INT NOT NULL REFERENCES locations(id),
    dest_location_id    INT NOT NULL REFERENCES locations(id),
    quantity            INT NOT NULL CHECK (quantity > 0)
);

-- ============================================
-- 10. ADJUSTMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS adjustments (
    id              SERIAL PRIMARY KEY,
    reference       VARCHAR(50) UNIQUE NOT NULL,
    product_id      INT NOT NULL REFERENCES products(id),
    location_id     INT NOT NULL REFERENCES locations(id),
    system_qty      INT NOT NULL,
    counted_qty     INT NOT NULL,
    difference      INT GENERATED ALWAYS AS (counted_qty - system_qty) STORED,
    reason          TEXT,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 11. STOCK LEDGER
-- ============================================
CREATE TABLE IF NOT EXISTS stock_ledger (
    id                  BIGSERIAL PRIMARY KEY,
    product_id          INT NOT NULL REFERENCES products(id),
    movement_type       VARCHAR(20) NOT NULL
                        CHECK (movement_type IN ('receipt','delivery','transfer_in','transfer_out','adjustment')),
    quantity            INT NOT NULL,
    source_location_id  INT REFERENCES locations(id),
    dest_location_id    INT REFERENCES locations(id),
    reference_type      VARCHAR(20) NOT NULL,
    reference_id        INT NOT NULL,
    notes               TEXT,
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ledger_product ON stock_ledger(product_id);
CREATE INDEX IF NOT EXISTS idx_ledger_movement ON stock_ledger(movement_type);
CREATE INDEX IF NOT EXISTS idx_ledger_created ON stock_ledger(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_reference ON stock_ledger(reference_type, reference_id);
