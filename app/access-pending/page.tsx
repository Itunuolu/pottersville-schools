import { Clock3, LogOut, Mail, ShieldAlert, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { getChatGPTUser } from "../chatgpt-auth";

export const dynamic = "force-dynamic";

export default async function AccessPendingPage({ searchParams }: { searchParams: Promise<{ suspended?: string }> }) {
  const identity = await getChatGPTUser();
  if (!identity) redirect("/login");
  const suspended = (await searchParams).suspended === "1";

  return (
    <main className="access-page">
      <a className="access-brand" href="/login"><span><Sparkles size={19} /></span><strong>PurpleStars<small>School portal</small></strong></a>
      <section className="access-card">
        <span className={`access-status-icon${suspended ? " suspended" : ""}`}>{suspended ? <ShieldAlert size={28} /> : <Clock3 size={28} />}</span>
        <p className="eyebrow">{suspended ? "Account unavailable" : "Activation required"}</p>
        <h1>{suspended ? "Your access is suspended." : "Your school account is almost ready."}</h1>
        <p>{suspended ? "An administrator has paused this account. Contact the school office if you believe this is a mistake." : "Your identity is verified, but a school administrator still needs to assign your student, teacher or administrator role."}</p>
        <div className="pending-identity"><Mail size={16} /><span><strong>Signed in as</strong><small>{identity.email}</small></span></div>
        <a href="/signout-with-chatgpt?return_to=%2Flogin"><LogOut size={15} />Sign in with another account</a>
      </section>
    </main>
  );
}
