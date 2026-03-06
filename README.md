# Tipjen Admin

Web admin terpisah untuk mengelola produk Tipjen. Terhubung ke Supabase yang sama dengan web buyer.

## Fitur
- Login admin sederhana via password
- Tambah, edit, hapus produk
- Tampilkan / sembunyikan produk
- Upload gambar manual dari galeri (disimpan sebagai data URL)
- Label/tag tersimpan untuk dipakai ulang
- Dark / light mode

## Setup
1. Salin `.env.example` menjadi `.env.local`
2. Isi env sesuai project Supabase Anda
3. Jalankan SQL pada `database/schema.sql`
4. Jalankan `npm install` lalu `npm run dev`
