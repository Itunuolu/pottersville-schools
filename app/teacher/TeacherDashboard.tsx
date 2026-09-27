"use client";

import {
  Bell,
  BookOpen,
  BusFront,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  ExternalLink,
  FilePenLine,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Sparkles,
  Ticket,
  Upload,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { LearningStudio } from "../components/LearningStudio";

type TeacherDashboardProps = {
  user: {
    displayName: string;
    email: string;
    role: "teacher" | "admin";
  };
};

const portal = "https://pottersvilleportalsec.pythonanywhere.com";

type PortalItem = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

const navigation: { label: string; items: PortalItem[] }[] = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", description: "Your daily dashboard", href: "#dashboard-main", icon: LayoutDashboard },
      { label: "School operations", description: "Attendance, results and assignments", href: "/operations", icon: Sparkles },
      { label: "My classes", description: "Assigned classes and subjects", href: `${portal}/staff/my-assignments/`, icon: GraduationCap },
      { label: "Students", description: "View students in your classes", href: `${portal}/students/student_list/`, icon: Users },
      { label: "Attendance", description: "Mark and review attendance", href: `${portal}/attendance/take-attendance/`, icon: ClipboardCheck },
    ],
  },
  {
    label: "Academic",
    items: [
      { label: "Score entry", description: "Enter CA and term scores", href: `${portal}/results/score-entry/`, icon: FilePenLine },
      { label: "Results", description: "Review termly and session results", href: `${portal}/results/report-cards/`, icon: ChartNoAxesCombined },
      { label: "Lesson notes", description: "Upload downloadable PDF notes", href: "#lesson-notes", icon: BookOpen },
      { label: "Quizzes & exams", description: "Create instantly graded assessments", href: "#assessments", icon: GraduationCap },
      { label: "E-learning", description: "Notes, assignments and resources", href: `${portal}/curriculum/`, icon: BookOpen },
    ],
  },
  {
    label: "School",
    items: [
      { label: "Calendar", description: "School events and dates", href: `${portal}/events/`, icon: CalendarDays },
      { label: "School bus", description: "Routes and fares", href: `${portal}/transport/bus_route_list/`, icon: BusFront },
      { label: "Help centre", description: "Guides and portal support", href: `${portal}/help-center/`, icon: CircleHelp },
      { label: "Tickets", description: "Requests and support tickets", href: `${portal}/tickets/`, icon: Ticket },
    ],
  },
];

const quickActions: PortalItem[] = [
  {
    label: "Mark attendance",
    description: "Take attendance for your next class",
    href: `${portal}/attendance/take-attendance/`,
    icon: ClipboardCheck,
  },
  {
    label: "Enter scores",
    description: "Add continuous assessment or exam scores",
    href: `${portal}/results/score-entry/`,
    icon: FilePenLine,
  },
  {
    label: "My students",
    description: "Open your student list and profiles",
    href: `${portal}/students/student_list/`,
    icon: Users,
  },
  {
    label: "E-learning",
    description: "Share learning notes and assignments",
    href: `${portal}/curriculum/`,
    icon: Upload,
  },
];

const defaultStats = [
  { label: "My students", value: "28", context: "across 3 classes", icon: Users, tone: "violet" },
  { label: "Classes today", value: "3", context: "next at 10:30 AM", icon: GraduationCap, tone: "violet" },
  { label: "Attendance", value: "92%", context: "↑ 3% this week", icon: ClipboardCheck, tone: "green" },
  { label: "Results pending", value: "4", context: "review by Friday", icon: FilePenLine, tone: "amber" },
];

const classes = [
  { time: "08:15", subject: "Basic Science", detail: "JSS 2A · 11 students", room: "Science Lab", status: "Completed", done: true },
  { time: "10:30", subject: "Biology", detail: "SS 1B · 9 students", room: "Room 12", status: "Next class", done: false },
  { time: "13:20", subject: "Agricultural Science", detail: "JSS 3A · 8 students", room: "School Farm", status: "Upcoming", done: false },
];

const activities = [
  { icon: Check, title: "Attendance submitted", detail: "JSS 2A", time: "8:48 AM", tone: "green" },
  { icon: FilePenLine, title: "12 scores added", detail: "Biology quiz", time: "Yesterday", tone: "amber" },
  { icon: CalendarDays, title: "New timetable published", detail: "School admin", time: "14 Jul", tone: "violet" },
];

export default function TeacherDashboard({ user }: TeacherDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCompact, setSidebarCompact] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<PortalItem | null>(null);
  const [liveStats, setLiveStats] = useState<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const firstName = user.displayName.split(/\s+/)[0] || "Teacher";
  const initials = user.displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "PV";

  const searchableItems = useMemo(
    () => navigation.flatMap((group) => group.items).filter((item) => item.href !== "#dashboard-main"),
    [],
  );

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return searchableItems.slice(0, 6);
    return searchableItems.filter((item) =>
      `${item.label} ${item.description}`.toLowerCase().includes(normalized),
    );
  }, [query, searchableItems]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }

      if (!isTyping && event.key === "/") {
        event.preventDefault();
        setSearchOpen(true);
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
        setSelectedAction(null);
        setNotificationsOpen(false);
        setProfileOpen(false);
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) window.setTimeout(() => searchInputRef.current?.focus(), 80);
    if (!searchOpen) setQuery("");
  }, [searchOpen]);

  useEffect(() => {
    fetch("/api/dashboard", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((payload) => payload && setLiveStats(payload.stats)).catch(() => undefined);
  }, []);

  const closeMobileNavigation = () => setSidebarOpen(false);

  return (
    <div className={`app-shell${sidebarCompact ? " sidebar-compact" : ""}`}>
      <button
        className={`mobile-backdrop${sidebarOpen ? " is-visible" : ""}`}
        aria-label="Close navigation"
        onClick={closeMobileNavigation}
      />

      <aside className={`sidebar${sidebarOpen ? " is-open" : ""}`} aria-label="Primary navigation">
        <div className="brand-row">
          <a className="brand" href="#dashboard-main" onClick={closeMobileNavigation}>
            <span className="brand-mark" aria-hidden="true"><img src="/images/pottersville-logo.png" alt="" /></span>
            <span className="brand-copy">Pottersville<small>School portal</small></span>
          </a>
          <button className="mobile-close" type="button" aria-label="Close menu" onClick={closeMobileNavigation}>
            <X size={19} />
          </button>
        </div>

        <nav className="nav-scroll">
          {navigation.map((group, groupIndex) => (
            <section className="nav-group" key={group.label} aria-labelledby={`nav-${groupIndex}`}>
              <p className="nav-label" id={`nav-${groupIndex}`}>{group.label}</p>
              <div className="nav-list">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isOverview = item.href === "#dashboard-main";
                  const isInternal = item.href.startsWith("#") || item.href.startsWith("/");
                  return (
                    <a
                      className={`nav-item${isOverview ? " active" : ""}`}
                      href={item.href}
                      key={item.label}
                      title={sidebarCompact ? item.label : undefined}
                      aria-current={isOverview ? "page" : undefined}
                      target={isInternal ? undefined : "_blank"}
                      rel={isInternal ? undefined : "noreferrer"}
                      onClick={closeMobileNavigation}
                    >
                      <span className="nav-icon"><Icon size={18} strokeWidth={1.9} /></span>
                      <span className="nav-text">{item.label}</span>
                      {!isInternal && <ExternalLink className="nav-external" size={13} aria-hidden="true" />}
                    </a>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a className="teacher-card" href={`${portal}/staff/teacher-my-detail/`} target="_blank" rel="noreferrer">
            <span className="avatar">{initials}</span>
            <span className="teacher-copy"><strong>{user.displayName}</strong><small>{user.role === "admin" ? "Administrator preview" : "Teacher account"}</small></span>
            <ChevronRight className="teacher-arrow" size={16} />
          </a>
          <button
            className="collapse-button"
            type="button"
            aria-label={sidebarCompact ? "Expand navigation" : "Collapse navigation"}
            onClick={() => setSidebarCompact((current) => !current)}
          >
            {sidebarCompact ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
        </div>
      </aside>

      <main id="dashboard-main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button menu-button" type="button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="date-block"><span>Today</span>Thursday, 16 July</div>
          </div>

          <div className="top-actions">
            <button className="search-button" type="button" onClick={() => setSearchOpen(true)}>
              <Search size={17} />
              <span>Find a portal tool</span>
              <kbd>Ctrl K</kbd>
            </button>

            <div className="popover-wrap">
              <button
                className="icon-button notification-button"
                type="button"
                aria-label="Notifications, 2 unread"
                aria-expanded={notificationsOpen}
                onClick={() => { setNotificationsOpen((current) => !current); setProfileOpen(false); }}
              >
                <Bell size={19} />
                <span className="notification-dot">2</span>
              </button>
              {notificationsOpen && (
                <div className="popover notifications-popover" role="dialog" aria-label="Notifications">
                  <div className="popover-heading"><div><strong>Notifications</strong><span>2 new updates</span></div><button type="button" onClick={() => setNotificationsOpen(false)} aria-label="Close notifications"><X size={16} /></button></div>
                  <a href={`${portal}/events/`} target="_blank" rel="noreferrer"><span className="notice-icon violet"><CalendarDays size={17} /></span><span><strong>Timetable updated</strong><small>Your Thursday timetable has changed.</small><time>18 minutes ago</time></span></a>
                  <a href={`${portal}/results/score-entry/`} target="_blank" rel="noreferrer"><span className="notice-icon amber"><FilePenLine size={17} /></span><span><strong>Scores due Friday</strong><small>Four result sheets still need review.</small><time>1 hour ago</time></span></a>
                </div>
              )}
            </div>

            <div className="popover-wrap">
              <button
                className="profile-button"
                type="button"
                aria-label="Open account menu"
                aria-expanded={profileOpen}
                onClick={() => { setProfileOpen((current) => !current); setNotificationsOpen(false); }}
              >
                <span className="avatar small">{initials}</span><span className="profile-name">{firstName}</span><ChevronDown size={15} />
              </button>
              {profileOpen && (
                <div className="popover profile-popover">
                  <div className="profile-summary"><span className="avatar">{initials}</span><span><strong>{user.displayName}</strong><small>{user.email} · {user.role}</small></span></div>
                  {user.role === "admin" && <a href="/admin"><Settings size={16} />Admin workspace</a>}
                  <a href="/profile"><UserRound size={16} />My profile & ID card</a>
                  <a href="/signout-with-chatgpt?return_to=%2Flogin"><Settings size={16} />Sign out</a>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="intro" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">Teacher dashboard</p>
            <h1 id="page-title">Good morning, {firstName}.</h1>
            <p className="intro-copy">Everything you need for a smooth school day, all in one place.</p>
          </div>
          <div className="week-note"><span className="week-dot" />Week 10 <span>·</span> Second term</div>
        </section>

        <section className="stats-grid" aria-label="Today at a glance">
          {(liveStats ? [
            { ...defaultStats[0], value: String(liveStats.students ?? 0), context: `across ${liveStats.assignedClasses ?? 0} classes` },
            { ...defaultStats[1], value: String(liveStats.assignedClasses ?? 0), context: `${liveStats.assignedSubjects ?? 0} subjects` },
            { ...defaultStats[2], value: String(liveStats.attendanceMarked ?? 0), context: "records marked today" },
            { ...defaultStats[3], value: String(liveStats.pendingResults ?? 0), context: "awaiting completion" },
          ] : defaultStats).map((stat) => {
            const Icon = stat.icon;
            return (
              <article className="stat-card" key={stat.label}>
                <div className="stat-top"><span>{stat.label}</span><span className={`stat-icon ${stat.tone}`}><Icon size={17} /></span></div>
                <div className="stat-bottom"><strong>{stat.value}</strong><span className={stat.tone}>{stat.context}</span></div>
              </article>
            );
          })}
        </section>

        <LearningStudio />

        <div className="dashboard-grid">
          <div className="primary-column">
            <section className="panel quick-panel" aria-labelledby="quick-actions-title">
              <div className="panel-header">
                <div><h2 id="quick-actions-title">Quick actions</h2><p>Your most-used tools</p></div>
              </div>
              <div className="quick-actions">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button className="quick-action" type="button" key={action.label} onClick={() => setSelectedAction(action)}>
                      <span className="action-icon"><Icon size={20} strokeWidth={1.9} /></span>
                      <span><strong>{action.label}</strong><small>{action.description}</small></span>
                      <ChevronRight className="action-arrow" size={17} />
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="panel classes-panel" aria-labelledby="classes-title">
              <div className="panel-header">
                <div><h2 id="classes-title">Today’s classes</h2><p>Thursday · 3 lessons</p></div>
                <a className="text-link" href={`${portal}/staff/my-assignments/`} target="_blank" rel="noreferrer">Full timetable <ChevronRight size={15} /></a>
              </div>
              <div className="schedule">
                {classes.map((schoolClass) => (
                  <article className={`class-row${schoolClass.status === "Next class" ? " is-next" : ""}`} key={`${schoolClass.time}-${schoolClass.subject}`}>
                    <time>{schoolClass.time}</time>
                    <div className="class-info"><strong>{schoolClass.subject}</strong><span>{schoolClass.detail}</span></div>
                    <span className="class-room">{schoolClass.room}</span>
                    <span className={`class-status${schoolClass.done ? " done" : ""}`}>{schoolClass.status}</span>
                  </article>
                ))}
              </div>
              <div className="next-class-action">
                <span><ClipboardCheck size={17} />Biology attendance opens at 10:20 AM</span>
                <a href={`${portal}/attendance/take-attendance/`} target="_blank" rel="noreferrer">Prepare attendance <ExternalLink size={14} /></a>
              </div>
            </section>
          </div>

          <aside className="secondary-column" aria-label="School updates">
            <section className="event-card" aria-labelledby="event-title">
              <div className="event-pattern one" /><div className="event-pattern two" />
              <div className="event-top"><span>Next school event</span><CalendarDays size={20} /></div>
              <p>Friday, 24 July · 10:00 AM</p>
              <h2 id="event-title">Inter-house<br />Sports Day</h2>
              <div className="event-footer"><span>Main field · All staff</span><a href={`${portal}/events/`} target="_blank" rel="noreferrer" aria-label="Open school calendar"><ChevronRight size={17} /></a></div>
            </section>

            <section className="panel activity-panel" aria-labelledby="activity-title">
              <div className="panel-header">
                <div><h2 id="activity-title">Recent activity</h2><p>Updates from your classes</p></div>
                <a className="text-link compact-link" href={`${portal}/dashboard/`} target="_blank" rel="noreferrer">View all</a>
              </div>
              <div className="activity-list">
                {activities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <article className="activity-row" key={activity.title}>
                      <span className={`activity-icon ${activity.tone}`}><Icon size={16} /></span>
                      <div><strong>{activity.title}</strong><span>{activity.detail}</span></div>
                      <time>{activity.time}</time>
                    </article>
                  );
                })}
              </div>
            </section>

          <section className="help-strip">
              <span className="help-icon"><CircleHelp size={18} /></span>
              <span><strong>Need a hand?</strong><small>Browse guides or contact support.</small></span>
              <a href={`${portal}/help-center/`} target="_blank" rel="noreferrer" aria-label="Open help centre"><ChevronRight size={17} /></a>
            </section>
          </aside>
        </div>
      </main>

      {searchOpen && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setSearchOpen(false); }}>
          <section className="search-dialog" role="dialog" aria-modal="true" aria-label="Find a portal tool">
            <div className="search-input-wrap"><Search size={20} /><input ref={searchInputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search students, results, attendance..." aria-label="Search portal tools" /><button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={18} /></button></div>
            <p className="search-caption">{query ? `${filteredItems.length} matching tools` : "Quick access"}</p>
            <div className="search-results">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                return <a href={item.href} target="_blank" rel="noreferrer" key={item.label} onClick={() => setSearchOpen(false)}><span className="result-icon"><Icon size={18} /></span><span><strong>{item.label}</strong><small>{item.description}</small></span><ExternalLink size={15} /></a>;
              })}
              {!filteredItems.length && <div className="empty-search"><Search size={24} /><strong>No tools found</strong><span>Try a simpler search term.</span></div>}
            </div>
            <div className="search-footer"><span><kbd>↑</kbd><kbd>↓</kbd> Browse</span><span><kbd>Esc</kbd> Close</span></div>
          </section>
          <a className="help-strip operations-strip" href="/operations">
            <span className="help-icon"><Sparkles size={18} /></span>
            <span><strong>Open school operations</strong><small>Attendance, results, assignments and updates.</small></span>
            <ChevronRight size={17} />
          </a>
        </div>
      )}

      {selectedAction && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setSelectedAction(null); }}>
          <section className="action-dialog" role="dialog" aria-modal="true" aria-labelledby="action-dialog-title">
            <button className="dialog-close" type="button" onClick={() => setSelectedAction(null)} aria-label="Close"><X size={18} /></button>
            <span className="dialog-icon"><selectedAction.icon size={24} /></span>
            <p className="eyebrow">Quick action</p>
            <h2 id="action-dialog-title">{selectedAction.label}</h2>
            <p>{selectedAction.description}. You’ll continue securely in the school portal.</p>
            <div className="dialog-actions"><button type="button" onClick={() => setSelectedAction(null)}>Not now</button><a href={selectedAction.href} target="_blank" rel="noreferrer" onClick={() => setSelectedAction(null)}>Open tool <ExternalLink size={15} /></a></div>
          </section>
        </div>
      )}
    </div>
  );
}
