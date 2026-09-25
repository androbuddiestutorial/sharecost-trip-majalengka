-- 1. Create Packages Table
CREATE TABLE IF NOT EXISTS packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    price_text VARCHAR(50) NOT NULL,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_popular BOOLEAN DEFAULT false,
    action_type VARCHAR(50) DEFAULT 'booking', -- 'booking' or 'contact'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insert Initial Data
INSERT INTO packages (title, description, price_text, features, is_popular, action_type) VALUES
('Open Trip', 'Bergabung dengan peserta lain', 'Mulai Rp 250.000', '["Transportasi PP dari Meeting Point", "Tiket Masuk & Asuransi", "Makan selama pendakian", "Tenda & Perlengkapan kelompok", "Guide Berpengalaman", "Dokumentasi Foto"]'::jsonb, true, 'booking'),
('Regular Trip', 'Jadwal khusus dengan fasilitas standar', 'Mulai Rp 350.000', '["Transportasi VIP dari Meeting Point", "Tiket Masuk & Asuransi", "Makan spesial selama pendakian", "Tenda & Perlengkapan kelompok", "Guide & Porter Tim", "Dokumentasi Foto & Video"]'::jsonb, false, 'booking'),
('Private Trip', 'Khusus untuk komunitas/grup Anda', 'Hubungi Kami', '["Penjemputan bebas (Door to Door)", "Jadwal bebas pilih tanggal", "Menu makanan sesuai request", "Tenda & Perlengkapan VIP", "Guide & Porter Khusus", "Dokumentasi Drone & Kamera Profesional"]'::jsonb, false, 'contact');
