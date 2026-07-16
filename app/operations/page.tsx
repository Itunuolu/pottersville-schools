import { requirePortalRole } from "../../lib/portal-auth";
import OperationsPortal from "./OperationsPortal";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  const user = await requirePortalRole("/operations", ["admin", "teacher", "student"]);
  return <OperationsPortal user={{ displayName: user.displayName, email: user.email, role: user.role, className: user.className }} />;
}
