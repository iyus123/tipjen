export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "tipjen123",
  storeName: process.env.STORE_NAME ?? "Tipjen",
  whatsappNumber: process.env.WHATSAPP_NUMBER ?? "083894403505",
};
