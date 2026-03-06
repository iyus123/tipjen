import AdminDashboard from "@/components/AdminDashboard";
import { env } from "@/lib/env";

export default function AdminPage() {
  return <AdminDashboard storeName={env.storeName} whatsappNumber={env.whatsappNumber} />;
}
