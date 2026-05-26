-- Supabase Schema for Pathology Lab App

-- Profiles table to store additional user info
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone_number TEXT UNIQUE,
  address TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Catalog table for tests and packages
CREATE TABLE IF NOT EXISTS catalog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT DEFAULT 'test', -- 'test' or 'package'
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Global settings table for timing, UPI, address, etc.
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  collection_type TEXT NOT NULL, -- 'lab' or 'home'
  address TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  scheduled_date DATE NOT NULL,
  scheduled_slot TEXT NOT NULL, -- e.g., '08:30 AM'
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for orders and catalog items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders ON DELETE CASCADE,
  item_id UUID REFERENCES catalog ON DELETE SET NULL,
  item_name TEXT NOT NULL, -- Store name at time of order
  price_at_time DECIMAL(10, 2) NOT NULL
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  file_url TEXT NOT NULL, -- Public URL or Storage Path
  file_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial settings
INSERT INTO settings (key, value) VALUES 
('lab_details', '{"name": "Vedant Pathology Lab", "address": "123 Main St, City", "phone": "+91 9876543210", "upi_id": "lab@upi"}'),
('timeslots', '{"start": "07:30", "end": "21:00", "interval": 30}')
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Basic Policies
DROP POLICY IF EXISTS "Public can view catalog" ON catalog;
CREATE POLICY "Public can view catalog" ON catalog FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view settings" ON settings;
CREATE POLICY "Public can view settings" ON settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile, but prevent them from changing their own is_admin status
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    (is_admin = (SELECT is_admin FROM profiles WHERE id = auth.uid()))
  );

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND (orders.user_id = auth.uid() OR auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true))));

DROP POLICY IF EXISTS "Users can view own reports" ON reports;
CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (user_id = auth.uid() OR auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- Admin Policies
DROP POLICY IF EXISTS "Admins can manage everything" ON catalog;
CREATE POLICY "Admins can manage everything" ON catalog FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "Admins can manage settings" ON settings;
CREATE POLICY "Admins can manage settings" ON settings FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
CREATE POLICY "Admins can manage orders" ON orders FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "Admins can manage reports" ON reports;
CREATE POLICY "Admins can manage reports" ON reports FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Trigger to automatically create profile on signup
-- This bypasses RLS and works even if email confirmation is required
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number, is_admin)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone_number',
    CASE 
      WHEN new.raw_user_meta_data->>'admin_code' = 'VEDANT_ADMIN_2026' THEN true 
      ELSE false 
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
