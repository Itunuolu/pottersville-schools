import { requirePortalRole } from "../../lib/portal-auth";
import TeacherDashboard from "./TeacherDashboard";

export const dynamic = "force-dynamic";

export default async function TeacherPage() {
  const user = await requirePortalRole("/teacher", ["teacher", "admin"]);
  return <TeacherDashboard user={{ displayName: user.displayName, email: user.email, role: user.role as "teacher" | "admin" }} />;
}
