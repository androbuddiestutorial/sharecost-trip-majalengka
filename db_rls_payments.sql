-- Mengizinkan user publik (anon) untuk INSERT ke tabel payments
CREATE POLICY "Allow public insert to payments" 
ON public.payments 
FOR INSERT 
TO public 
WITH CHECK (true);

-- (Opsional) Jika anon belum diizinkan membaca pembayaran mereka sendiri untuk verifikasi (meski di cek-pesanan kita butuh baca)
CREATE POLICY "Allow public select on payments" 
ON public.payments 
FOR SELECT 
TO public 
USING (true);

-- (Opsional) Mengizinkan user publik untuk upload ke storage 'gallery' (jika error upload file)
-- Karena bukti upload disimpan di bucket 'gallery'
CREATE POLICY "Allow public upload to gallery" 
ON storage.objects 
FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Allow public update to gallery" 
ON storage.objects 
FOR UPDATE 
TO public 
USING (bucket_id = 'gallery');
