import { BookOpen, GraduationCap, IdCard, LogOut, Mail, School, ShieldCheck, Sparkles, UserCog } from "lucide-react";
import { requirePortalRole } from "../../lib/portal-auth";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requirePortalRole("/profile", ["admin", "teacher", "student"]);
  const initials = user.displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "PS";
  const Icon = user.role === "admin" ? UserCog : user.role === "teacher" ? BookOpen : GraduationCap;
  return <main className="profile-page"><header><a href="/"><span><Sparkles size={18} /></span><strong>PurpleStars<small>My school profile</small></strong></a><a href="/">Back to dashboard</a></header><section className="profile-card"><div className="profile-cover" /><div className="profile-avatar-large">{initials}</div><div className="profile-heading"><p className="eyebrow">Verified school account</p><h1>{user.displayName}</h1><span><Icon size={14} />{user.role}</span></div><div className="profile-details"><div><Mail size={17} /><span><small>Approved email</small><strong>{user.email}</strong></span></div><div><School size={17} /><span><small>School</small><strong>PurpleStars School, New Oko Oba</strong></span></div><div><GraduationCap size={17} /><span><small>Class or workspace</small><strong>{user.className || `${user.role} workspace`}</strong></span></div><div><ShieldCheck size={17} /><span><small>Account status</small><strong>{user.status}</strong></span></div></div><div className="profile-actions"><a href="/id-card"><IdCard size={16} />View school ID card</a><a href="/signout-with-chatgpt?return_to=%2Flogin"><LogOut size={16} />Sign out</a></div></section></main>;
}
