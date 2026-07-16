"use client";

import { Activity, BookOpen, CheckCircle2, ChevronRight, GraduationCap, LayoutDashboard, LoaderCircle, LogOut, Plus, Search, ShieldCheck, Sparkles, UserCog, Users, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type PortalUserRow = {
  id: number;
  email: string;
  displayName: string;
  role: "admin" | "teacher" | "student";
  status: "active" | "suspended";
  className: string | null;
  createdAt: string;
};

async function readError(response: Response) {
  try { return ((await response.json()) as { error?: string }).error || "Something went wrong."; }
  catch { return "Something went wrong."; }
}

export default function AdminDashboard({ currentUser }: { currentUser: { displayName: string; email: string } }) {
  const [users, setUsers] = useState<PortalUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [newRole, setNewRole] = useState<"teacher" | "student" | "admin">("student");

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      if (!response.ok) throw new Error(await readError(response));
      setUsers(((await response.json()) as { users: PortalUserRow[] }).users);
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "Accounts could not be loaded." });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter((user) => `${user.displayName} ${user.email} ${user.role} ${user.className || ""}`.toLowerCase().includes(normalized));
  }, [query, users]);

  const counts = useMemo(() => ({
    students: users.filter((user) => user.role === "student" && user.status === "active").length,
    teachers: users.filter((user) => user.role === "teacher" && user.status === "active").length,
    admins: users.filter((user) => user.role === "admin" && user.status === "active").length,
    suspended: users.filter((user) => user.status === "suspended").length,
  }), [users]);

  const showMessage = (tone: "success" | "error", text: string) => {
    setMessage({ tone, text });
    window.setTimeout(() => setMessage(null), 4500);
  };

  const addUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch("/api/admin/users", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ displayName: data.get("displayName"), email: data.get("email"), role: data.get("role"), className: data.get("className") }) });
      if (!response.ok) throw new Error(await readError(response));
      form.reset(); setNewRole("student"); setAddOpen(false); showMessage("success", "Account created. The user can now sign in with this email."); await loadUsers();
    } catch (error) { showMessage("error", error instanceof Error ? error.message : "Account could not be created."); }
    finally { setSaving(false); }
  };

  const updateUser = async (user: PortalUserRow, updates: Partial<PortalUserRow>) => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: user.id, role: updates.role ?? user.role, status: updates.status ?? user.status, className: updates.className ?? user.className, displayName: updates.displayName ?? user.displayName }) });
      if (!response.ok) throw new Error(await readError(response));
      showMessage("success", `${user.displayName}'s access was updated.`); await loadUsers();
    } catch (error) { showMessage("error", error instanceof Error ? error.message : "Account could not be updated."); }
    finally { setSaving(false); }
  };

  const initials = currentUser.displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "AD";

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="brand admin-brand" href="/admin"><span className="brand-mark"><Sparkles size={19} /></span><span className="brand-copy">PurpleStars<small>Admin portal</small></span></a>
        <nav><a className="active" href="/admin"><LayoutDashboard size={17} />Overview</a><a href="#accounts"><Users size={17} />User accounts</a><a href="/teacher"><BookOpen size={17} />Teacher workspace</a><a href="/student"><GraduationCap size={17} />Student preview</a></nav>
        <div className="admin-user"><span>{initials}</span><div><strong>{currentUser.displayName}</strong><small>Administrator</small></div><a href="/signout-with-chatgpt?return_to=%2Flogin" aria-label="Sign out"><LogOut size={16} /></a></div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar"><div><p className="eyebrow">School administration</p><h1>Welcome, {currentUser.displayName.split(/\s+/)[0]}.</h1><p>Manage secure access for every student, teacher and administrator.</p></div><button type="button" onClick={() => setAddOpen(true)}><Plus size={16} />Add school account</button></header>
        {message && <div className={`admin-message ${message.tone}`}><CheckCircle2 size={16} />{message.text}</div>}
        <section className="admin-stat-grid" aria-label="Account summary"><article><span className="admin-stat-icon student"><GraduationCap size={19} /></span><div><strong>{counts.students}</strong><small>Active students</small></div></article><article><span className="admin-stat-icon teacher"><BookOpen size={18} /></span><div><strong>{counts.teachers}</strong><small>Active teachers</small></div></article><article><span className="admin-stat-icon"><ShieldCheck size={18} /></span><div><strong>{counts.admins}</strong><small>Administrators</small></div></article><article><span className="admin-stat-icon suspended"><Activity size={18} /></span><div><strong>{counts.suspended}</strong><small>Suspended</small></div></article></section>
        <section className="admin-accounts panel" id="accounts">
          <div className="admin-accounts-head"><div><h2>School accounts</h2><p>Only approved emails can enter a role workspace.</p></div><label><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people or roles" /></label></div>
          <div className="accounts-table-wrap"><table><thead><tr><th>Person</th><th>Role</th><th>Class</th><th>Status</th><th>Access</th></tr></thead><tbody>{loading ? <tr><td colSpan={5}><div className="admin-loading"><LoaderCircle className="spin" size={18} />Loading accounts…</div></td></tr> : filteredUsers.map((user) => <tr key={user.id}><td><div className="account-person"><span>{user.displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span><div><strong>{user.displayName}</strong><small>{user.email}</small></div></div></td><td><select value={user.role} disabled={saving || user.email === currentUser.email} onChange={(event) => void updateUser(user, { role: event.target.value as PortalUserRow["role"] })}><option value="student">Student</option><option value="teacher">Teacher</option><option value="admin">Administrator</option></select></td><td>{user.role === "student" ? <input className="table-class-input" defaultValue={user.className || ""} placeholder="Class" onBlur={(event) => { if (event.target.value !== (user.className || "")) void updateUser(user, { className: event.target.value }); }} /> : <span className="not-applicable">—</span>}</td><td><span className={`account-status ${user.status}`}>{user.status}</span></td><td><button className={user.status === "active" ? "suspend" : "activate"} type="button" disabled={saving || user.email === currentUser.email} onClick={() => void updateUser(user, { status: user.status === "active" ? "suspended" : "active" })}>{user.status === "active" ? "Suspend" : "Activate"}</button></td></tr>)}{!loading && !filteredUsers.length && <tr><td colSpan={5}><div className="admin-empty"><Users size={22} /><strong>No accounts found</strong><span>Add a school account or change your search.</span></div></td></tr>}</tbody></table></div>
        </section>
      </main>

      {addOpen && <div className="dialog-backdrop admin-dialog-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target && !saving) setAddOpen(false); }}><section className="studio-dialog admin-add-dialog" role="dialog" aria-modal="true" aria-labelledby="add-user-title"><button className="dialog-close" type="button" disabled={saving} aria-label="Close" onClick={() => setAddOpen(false)}><X size={18} /></button><span className="dialog-icon"><UserCog size={23} /></span><p className="eyebrow">Role assignment</p><h2 id="add-user-title">Add a school account</h2><p className="dialog-description">The person will sign in securely with this exact email and enter the assigned workspace.</p><form className="studio-form" onSubmit={addUser}><label><span>Full name</span><input name="displayName" required maxLength={100} placeholder="e.g. Adaeze Okafor" /></label><label><span>Approved email</span><input name="email" type="email" required maxLength={180} placeholder="person@example.com" /></label><div className="form-grid two"><label><span>School role</span><select name="role" value={newRole} onChange={(event) => setNewRole(event.target.value as typeof newRole)}><option value="student">Student</option><option value="teacher">Teacher</option><option value="admin">Administrator</option></select></label>{newRole === "student" && <label><span>Class</span><input name="className" required placeholder="e.g. SS 1B" /></label>}</div><div className="role-explainer"><ShieldCheck size={16} /><span><strong>Access is enforced on the server</strong><small>Users cannot switch roles or enter another dashboard by editing a web address.</small></span></div><div className="dialog-actions"><button type="button" disabled={saving} onClick={() => setAddOpen(false)}>Cancel</button><button className="solid-action" type="submit" disabled={saving}>{saving ? <><LoaderCircle className="spin" size={15} />Creating…</> : <>Create account <ChevronRight size={15} /></>}</button></div></form></section></div>}
    </div>
  );
}
