import { ArrowRight, BookOpen, GraduationCap, LockKeyhole, ShieldCheck, Sparkles, UserCog } from "lucide-react";
import { redirect } from "next/navigation";
import { getChatGPTUser } from "../chatgpt-auth";
import { redirectToPortalHome } from "../../lib/portal-auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ return_to?: string }> }) {
  const identity = await getChatGPTUser();
  if (identity) await redirectToPortalHome();

  const query = await searchParams;
  const candidate = query.return_to || "/";
  const returnTo = candidate.startsWith("/") && !candidate.startsWith("//") ? candidate : "/";
  const signInHref = `/signin-with-chatgpt?return_to=${encodeURIComponent(returnTo)}`;

  return (
    <main className="login-page">
      <section className="login-story" aria-label="PurpleStars school portal">
        <div className="login-brand"><span><Sparkles size={21} /></span><strong>PurpleStars<small>School portal</small></strong></div>
        <div className="login-story-copy">
          <p className="eyebrow">One connected school</p>
          <h1>Everything your school day needs.</h1>
          <p>Secure spaces for learning, teaching, assessment and school management—all in one clear portal.</p>
        </div>
        <div className="login-role-preview">
          <article><span><GraduationCap size={19} /></span><div><strong>Students</strong><small>Learn, take assessments and see results.</small></div></article>
          <article><span><BookOpen size={18} /></span><div><strong>Teachers</strong><small>Teach, publish and track progress.</small></div></article>
          <article><span><UserCog size={19} /></span><div><strong>Administrators</strong><small>Manage people, access and school operations.</small></div></article>
        </div>
        <p className="login-story-foot">PurpleStars School · New Oko Oba</p>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <span className="login-lock"><LockKeyhole size={23} /></span>
          <p className="eyebrow">Secure school access</p>
          <h2>Welcome back</h2>
          <p>Sign in with your approved account. The portal will open the correct student, teacher or administrator workspace automatically.</p>
          <a className="school-signin-button" href={signInHref}><ShieldCheck size={18} /><span><strong>Continue to school portal</strong><small>Secure identity verification</small></span><ArrowRight size={18} /></a>
          <div className="login-security-note"><ShieldCheck size={15} /><span><strong>Your account stays protected</strong><small>PurpleStars never sees or stores your sign-in password.</small></span></div>
          <p className="login-help">Need access? Contact the school administrator to activate your email and assign your role.</p>
          <a className="login-tour-link" href="/tour">View the investor product tour <ArrowRight size={14} /></a>
        </div>
      </section>
    </main>
  );
}
