import { requirePortalRole } from "../../lib/portal-auth";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requirePortalRole("/admin", ["admin"]);
  return <AdminDashboard currentUser={{ displayName: user.displayName, email: user.email }} />;
}
