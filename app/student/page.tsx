import { requirePortalRole } from "../../lib/portal-auth";
import StudentDashboard from "./StudentDashboard";

export const dynamic = "force-dynamic";

export default async function StudentPage() {
  const user = await requirePortalRole("/student", ["student", "teacher", "admin"]);
  return <StudentDashboard user={{ displayName: user.displayName, email: user.email, role: user.role, className: user.className }} />;
}
