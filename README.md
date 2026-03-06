# Tipjen Admin

Web admin khusus penjual untuk mengelola katalog Tipjen.

## Environment Variables

Copy `.env.example` ke `.env.local` lalu isi:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `STORE_NAME`
- `WHATSAPP_NUMBER`

## Jalankan lokal

```bash
npm install
npm run dev
```

## Deploy Vercel

Upload project ini ke repo GitHub terpisah, lalu import ke Vercel.

## Supabase

Jalankan file `database/schema.sql` di SQL Editor Supabase.
