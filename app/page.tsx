import { redirect } from "next/navigation";
import { getChatGPTUser } from "./chatgpt-auth";
import { redirectToPortalHome } from "../lib/portal-auth";

export const dynamic = "force-dynamic";

export default async function PortalEntry() {
  const identity = await getChatGPTUser();
  if (!identity) redirect("/login");
  await redirectToPortalHome();
}
