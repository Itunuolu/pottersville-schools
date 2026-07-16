import { IdCard, Printer, Sparkles } from "lucide-react";
import { requirePortalRole } from "../../lib/portal-auth";

export const dynamic = "force-dynamic";

export default async function IdCardPage() {
  const user = await requirePortalRole("/id-card", ["admin", "teacher", "student"]);
  const initials = user.displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "PS";
  const identifier = `PS-${user.role.slice(0, 3).toUpperCase()}-${String(user.id).padStart(4, "0")}`;

  return (
    <main className="id-page">
      <header><a href="/profile">← Back to profile</a><span><Printer size={15} />Press Ctrl+P to print</span></header>
      <section className="school-id-card">
        <div className="id-card-top"><span><Sparkles size={20} /></span><strong>PurpleStars School<small>Official identification card</small></strong></div>
        <div className="id-card-body">
          <div className="id-photo">{initials}</div>
          <div><p className="eyebrow">{user.role} identification</p><h1>{user.displayName}</h1><dl><div><dt>ID number</dt><dd>{identifier}</dd></div><div><dt>Class / unit</dt><dd>{user.className || user.role}</dd></div><div><dt>Valid session</dt><dd>2026/2027</dd></div></dl></div>
          <div className="id-code" aria-label="Verification pattern">{Array.from({ length: 49 }, (_, index) => <span className={(index * 7 + user.id) % 3 === 0 ? "filled" : ""} key={index} />)}</div>
        </div>
        <div className="id-card-foot"><span>Property of PurpleStars School · New Oko Oba</span><strong>VALID</strong></div>
      </section>
      <p className="id-print-note"><IdCard size={15} />Use your browser’s print command to print or save this card as PDF.</p>
    </main>
  );
}
