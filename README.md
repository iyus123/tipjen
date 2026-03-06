# WA Shop Starter

Project ini berisi 2 halaman yang tetap saling terhubung:

- `/admin` untuk penjual
- `/shop` untuk pembeli

Setiap produk yang ditambah atau diubah dari halaman penjual akan tersimpan di database Supabase, lalu langsung ikut muncul di halaman pembeli jika statusnya **published**.

## Fitur

- Login admin sederhana
- Tambah, edit, hapus produk
- Atur harga, stok, kategori, gambar, deskripsi
- Publish / unpublish produk
- Halaman pembeli hanya melihat produk published
- Checkout pembeli diarahkan ke WhatsApp

## Cara menjalankan

1. Buat project Supabase.
2. Jalankan isi file `database/schema.sql` di SQL Editor Supabase.
3. Copy `.env.example` menjadi `.env.local`.
4. Isi semua environment variable.
5. Install dependency:

```bash
npm install
```

6. Jalankan project:

```bash
npm run dev
```

7. Buka:

- `http://localhost:3000/shop`
- `http://localhost:3000/admin`

## Environment yang harus diisi

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_TOKEN`
- `STORE_NAME`
- `STORE_WHATSAPP`

## Catatan penting

Versi ini sudah cocok untuk starter project dan hosting sederhana. Namun untuk produksi yang lebih aman, sebaiknya nanti ditingkatkan lagi dengan:

- Supabase Auth atau login admin yang lebih aman
- upload gambar ke storage
- validasi form yang lebih ketat
- dashboard order
- notifikasi stok
