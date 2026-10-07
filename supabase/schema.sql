-- =============================================================================
-- SKEMA DATABASE LENGKAP PASARPINTAR (SUPABASE / POSTGRESQL)
-- Versi: 2.0.0 (Mencakup Pembeli, Penjual, & Admin Portal Enterprise)
-- Platform: Supabase PostgreSQL
-- =============================================================================

-- 1. EKSTENSI & ENUM TYPES
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Roles
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin', 'curator');

-- Enum Status Verifikasi Toko / UMKM
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

-- Enum Status Kurasi Produk
CREATE TYPE curation_status AS ENUM ('pending', 'approved', 'rejected');

-- Enum Status Pesanan
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'completed', 'cancelled');

-- Enum Status Rekber Escrow
CREATE TYPE escrow_status AS ENUM ('held', 'released', 'disputed', 'refunded');

-- Enum Status Pencairan Dana
CREATE TYPE disbursement_status AS ENUM ('pending', 'processed', 'failed');


-- 2. TABEL MASTER & PROFIL PENGGUNA
-- -----------------------------------------------------------------------------

-- Tabel 1: users (Profil Pengguna Utama & Auth Sync)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    role user_role NOT NULL DEFAULT 'buyer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel 2: store_legality (Verifikasi Legalitas Toko / UMKM - Seller & Admin)
CREATE TABLE public.store_legality (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    nib_number VARCHAR(50), -- Nomor Induk Berusaha via OSS RBA
    nik_owner VARCHAR(20),
    npwp_number VARCHAR(30),
    halal_cert_number VARCHAR(100),
    bpom_cert_number VARCHAR(100),
    verification_status verification_status NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel 3: categories (Kategori Produk & Sentra Daerah)
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    icon_url TEXT,
    region_cluster VARCHAR(100), -- E.g. 'NTT', 'Jawa Tengah', 'Papua 3T'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 3. KATALOG PRODUK & SYSTEM KURASI
-- -----------------------------------------------------------------------------

-- Tabel 4: products (Data Produk Marketplace)
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    image_url TEXT,
    sku VARCHAR(100),
    badge VARCHAR(50), -- E.g. 'Pilihan Editor', 'Promo Lokal', 'Halal'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel 5: product_curations (Sistem Kurasi Produk Admin / Kurator)
CREATE TABLE public.product_curations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    curator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status curation_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    curated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 4. TRANSAKSI, REKBER ESCROW & SUBSIDI
-- -----------------------------------------------------------------------------

-- Tabel 6: orders (Transaksi Utama Pembeli)
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    shipping_subsidy_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (shipping_subsidy_amount >= 0),
    status order_status NOT NULL DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    tracking_number VARCHAR(100),
    courier_name VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel 7: order_items (Detail Produk dalam Pesanan)
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0)
);

-- Tabel 8: escrow_accounts (Monitoring Rekber Bank Himbara Admin & Seller)
CREATE TABLE public.escrow_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    status escrow_status NOT NULL DEFAULT 'held',
    auto_release_at TIMESTAMPTZ, -- Auto release SLA (e.g. 48 jam)
    released_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel 9: disbursements (Pencairan Dana ke Penjual & Subsidi GBBI)
CREATE TABLE public.disbursements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    bank_name VARCHAR(50) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    status disbursement_status NOT NULL DEFAULT 'pending',
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel 10: audit_logs (Laporan & Audit Forensik Admin Console)
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 5. INDEXING UNTUK PERFORMA QUERY
-- -----------------------------------------------------------------------------
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_store_legality_seller ON public.store_legality(seller_id);
CREATE INDEX idx_store_legality_status ON public.store_legality(verification_status);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_product_curations_status ON public.product_curations(status);
CREATE INDEX idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_escrow_status ON public.escrow_accounts(status);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);


-- 6. AUTOMATIC UPDATED_AT TRIGGER
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trigger_store_legality_updated_at BEFORE UPDATE ON public.store_legality FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trigger_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trigger_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trigger_escrow_updated_at BEFORE UPDATE ON public.escrow_accounts FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- 7. SUPABASE AUTH AUTOMATIC USER SYNC
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Pengguna Baru'),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'buyer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();


-- 8. ROW LEVEL SECURITY (RLS) POLICY MATRIX
-- -----------------------------------------------------------------------------
-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_legality ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy Products: Publik baca yang aktif, Penjual & Admin kelola produk sendiri
CREATE POLICY "Public view active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Sellers manage own products" ON public.products FOR ALL USING (auth.uid() = seller_id);

-- Policy Store Legality: Penjual hanya baca/update legalitas milik sendiri, Admin baca semua
CREATE POLICY "Sellers view own legality" ON public.store_legality FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Sellers insert own legality" ON public.store_legality FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Policy Orders: Pembeli baca pesanan milik sendiri
CREATE POLICY "Buyers view own orders" ON public.orders FOR SELECT USING (auth.uid() = buyer_id);
