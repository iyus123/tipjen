# Tipjen Admin

Web admin terpisah untuk mengelola produk toko Tipjen.

## Fitur
- Login admin sederhana dengan password
- Tambah, edit, hapus produk
- Publish / unpublish produk
- Upload gambar manual dari galeri perangkat
- Sinkron ke web buyer melalui Supabase yang sama

## Menjalankan lokal
1. `npm install`
2. copy `.env.example` menjadi `.env.local`
3. isi semua environment variable
4. `npm run dev`

## Deploy ke Vercel
Tambahkan environment variables berikut:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `STORE_NAME`
- `WHATSAPP_NUMBER`

## Catatan upload gambar
Versi ini menyimpan gambar upload galeri sebagai data URL langsung ke database.
Ini praktis untuk penggunaan awal dan gambar ukuran kecil-menengah.
Kalau nanti toko makin besar, sebaiknya upgrade ke Supabase Storage.
hadeeeh
