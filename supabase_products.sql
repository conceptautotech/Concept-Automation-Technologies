-- SQL commands for creating the products table in Supabase
-- Paste these into your Supabase Dashboard SQL Editor and run it.

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    part_number TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL,
    price TEXT NOT NULL DEFAULT 'On Request',
    description TEXT,
    specifications JSONB NOT NULL DEFAULT '[]'::jsonb,
    image TEXT,
    slug TEXT UNIQUE NOT NULL,
    stock BOOLEAN NOT NULL DEFAULT true,
    stock_count INTEGER NOT NULL DEFAULT 1,
    is_custom BOOLEAN NOT NULL DEFAULT false,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migration query to add column to existing tables:
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price TEXT NOT NULL DEFAULT 'On Request';

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop table policies if they exist to prevent duplication errors
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow write operations to products" ON public.products;

-- 1. Allow public (anonymous) read access to products
CREATE POLICY "Allow public read access to products" ON public.products
    FOR SELECT USING (true);

-- 2. Allow public inserts, updates, and deletes
-- (Secure administration is handled on the client-side via username/password check)
CREATE POLICY "Allow write operations to products" ON public.products
    FOR ALL USING (true) WITH CHECK (true);

-- 3. Create a storage bucket for product images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop storage policies if they exist to prevent duplication errors
DROP POLICY IF EXISTS "Allow public read access to product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public write access to product-images" ON storage.objects;

-- Storage policies to allow public access to files
CREATE POLICY "Allow public read access to product-images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

-- Storage policies to allow anyone to upload files to product-images
CREATE POLICY "Allow public write access to product-images" ON storage.objects
    FOR ALL USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');

-- 4. Create settings table for global options
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL
);

-- Enable RLS for settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Drop settings policies if they exist to prevent duplication errors
DROP POLICY IF EXISTS "Allow public read access to settings" ON public.settings;
DROP POLICY IF EXISTS "Allow write operations to settings" ON public.settings;

-- Settings policies to allow public read access
CREATE POLICY "Allow public read access to settings" ON public.settings
    FOR SELECT USING (true);

-- Settings policies to allow write access
CREATE POLICY "Allow write operations to settings" ON public.settings
    FOR ALL USING (true) WITH CHECK (true);

-- Insert default setting for stock visibility
INSERT INTO public.settings (key, value)
VALUES ('show_stock_status', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;
