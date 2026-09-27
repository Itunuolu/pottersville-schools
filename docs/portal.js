const session = readJSON(sessionStorage.getItem("pottersville-demo-session"));
if (!session || !["admin", "teacher", "student"].includes(session.role)) {
  window.location.replace("index.html");
  throw new Error("A valid Pottersville demo session is required.");
}

const PAGE_META = {
  dashboard: ["Dashboard", "Live school information and next actions"],
  academics: ["Academic setup", "Sessions, classes, subjects, accounts, and timetable"],
  attendance: ["Attendance", "Daily class registers and attendance history"],
  lessons: ["Lesson notes", "PDF learning resources organised for every class"],
  assignments: ["Assignments", "Tasks, submissions, grading, and feedback"],
  assessments: ["Quizzes & exams", "Question management and immediate student scoring"],
  results: ["Results & reports", "Scores, approvals, report cards, and printing"],
  communications: ["Announcements & events", "School and class communication"],
  support: ["Support", "Track portal requests from submission to resolution"],
  profile: ["My profile", "Verified demonstration account information"]
};

const NAV = [
  ["dashboard", "⌂", "Dashboard", ["admin", "teacher", "student"]],
  ["academics", "◎", "Academic setup", ["admin"]],
  ["attendance", "✓", "Attendance", ["admin", "teacher", "student"]],
  ["lessons", "▤", "Lesson notes", ["admin", "teacher", "student"]],
  ["assignments", "□", "Assignments", ["admin", "teacher", "student"]],
  ["assessments", "✎", "Quizzes & exams", ["admin", "teacher", "student"]],
  ["results", "↗", "Results & reports", ["admin", "teacher", "student"]],
  ["communications", "◉", "Announcements", ["admin", "teacher", "student"]],
  ["support", "?", "Support", ["admin", "teacher", "student"]],
  ["profile", "♙", "My profile", ["admin", "teacher", "student"]]
];

const DEFAULT_DATA = {
  session: { name: "2026/2027", term: "First Term" },
  classes: [
    { id: 1, name: "JSS 2A", level: "JSS 2", students: 32, teacher: "Akinkugbe Faith" },
    { id: 2, name: "JSS 3A", level: "JSS 3", students: 30, teacher: "Akinkugbe Faith" },
    { id: 3, name: "SS 1B", level: "SS 1", students: 28, teacher: "Akinkugbe Faith" }
  ],
  subjects: ["Basic Science", "Biology", "Agricultural Science", "Mathematics", "English Language"],
  students: [
    ["Amara Okafor", "PVNT016"], ["David Bello", "PVNT017"], ["Chiamaka Eze", "PVNT018"], ["Tobi Williams", "PVNT019"], ["Zainab Musa", "PVNT020"], ["Favour James", "PVNT021"], ["Daniel Adeyemi", "PVNT022"], ["Ada Nwosu", "PVNT023"]
  ],
  attendance: { PVNT016: "present", PVNT017: "present", PVNT018: "late", PVNT019: "present", PVNT020: "absent", PVNT021: "present", PVNT022: "present", PVNT023: "present" },
  attendanceSavedAt: "2026-07-16T08:35:00.000Z",
  lessons: [
    { id: 1, subject: "Biology", className: "SS 1B", week: 4, title: "Cell Structure and Organisation", teacher: "Akinkugbe Faith", file: "biology-cell-structure.pdf", published: true },
    { id: 2, subject: "Mathematics", className: "SS 1B", week: 4, title: "Linear Equations", teacher: "Mr Adeyemi", file: "linear-equations.pdf", published: true },
    { id: 3, subject: "English Language", className: "SS 1B", week: 4, title: "Comprehension Skills", teacher: "Mrs James", file: "comprehension-skills.pdf", published: true }
  ],
  assignments: [
    { id: 1, subject: "Biology", className: "SS 1B", title: "Cell comparison worksheet", due: "2026-07-18", maxScore: 20, status: "published" },
    { id: 2, subject: "Mathematics", className: "SS 1B", title: "Linear equations practice", due: "2026-07-19", maxScore: 20, status: "published" },
    { id: 3, subject: "English Language", className: "SS 1B", title: "Comprehension response", due: "2026-07-22", maxScore: 15, status: "published" }
  ],
  submissions: [{ assignmentId: 1, student: "Amara Okafor", content: "Plant cells have a cell wall and chloroplasts, while animal cells do not.", score: null, feedback: "" }],
  attempts: [],
  resultsApproved: true,
  results: [
    { subject: "Biology", teacher: "Akinkugbe Faith", ca: 34, exam: 52 },
    { subject: "Mathematics", teacher: "Mr Adeyemi", ca: 31, exam: 47 },
    { subject: "English Language", teacher: "Mrs James", ca: 29, exam: 44 },
    { subject: "Agricultural Science", teacher: "Akinkugbe Faith", ca: 36, exam: 50 },
    { subject: "Basic Science", teacher: "Akinkugbe Faith", ca: 30, exam: 39 }
  ],
  announcements: [
    { id: 1, title: "Welcome to the Pottersville portal", body: "Explore the connected learning, attendance, and assessment tools prepared for our school community.", audience: "Everyone", author: "Administration", date: "16 Jul" },
    { id: 2, title: "Biology quiz opens today", body: "SS 1B students should complete the Week 4 knowledge check before Friday.", audience: "SS 1B", author: "Akinkugbe Faith", date: "16 Jul" },
    { id: 3, title: "Inter-house Sports Day", body: "Sports Day takes place on Friday 24 July at the main field.", audience: "Everyone", author: "Administration", date: "15 Jul" }
  ],
  tickets: [{ id: 1, subject: "Report card printing", category: "Results", message: "Please confirm the correct print settings for term reports.", status: "resolved", owner: "Akinkugbe Faith" }]
};

let data = loadData();
const page = document.body.dataset.page || "dashboard";
const allowed = NAV.find(item => item[0] === page)?.[3] || [];
if (!allowed.includes(session.role)) window.location.replace("dashboard.html");

function readJSON(value) { try { return JSON.parse(value); } catch { return null; } }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function loadData() { return readJSON(localStorage.getItem("pottersville-demo-data")) || clone(DEFAULT_DATA); }
function saveData() { localStorage.setItem("pottersville-demo-data", JSON.stringify(data)); }
function esc(value) { return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]); }
function initials(name) { return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase(); }
function roleName(role) { return role === "admin" ? "Administrator" : role === "teacher" ? "Teacher" : "Student"; }
function grade(total) { return total >= 80 ? "A" : total >= 70 ? "B" : total >= 60 ? "C" : total >= 50 ? "D" : "F"; }
function pageFile(id) { return `${id}.html`; }
function today() { return "Thursday, 16 July 2026"; }

document.getElementById("portal-app").innerHTML = `
  <div class="portal-shell">
    <aside class="sidebar" id="sidebar">
      <a class="brand" href="dashboard.html"><span class="brand-mark">✦</span><span>Pottersville<small>School portal demo</small></span></a>
      <div class="role-badge"><small>Signed in as</small><strong>${roleName(session.role)} workspace</strong></div>
      <nav class="portal-nav">${NAV.filter(item => item[3].includes(session.role)).map(item => `<a class="${page === item[0] ? "active" : ""}" href="${pageFile(item[0])}"><i>${item[1]}</i><span>${item[2]}</span></a>`).join("")}</nav>
      <div class="sidebar-account"><span class="sidebar-avatar">${initials(session.name)}</span><div><strong>${esc(session.name)}</strong><small>${esc(session.email)}</small></div><button id="logout" title="Sign out" aria-label="Sign out">↪</button></div>
    </aside>
    <div class="mobile-backdrop" id="mobile-backdrop"></div>
    <main class="portal-main">
      <header class="topbar"><div class="topbar-copy"><small>${roleName(session.role)} portal · ${data.session.term}</small><h1>${PAGE_META[page][0]}</h1></div><div class="topbar-actions"><button class="mobile-menu" id="mobile-menu">☰ Menu</button><a href="investor-tour.html">Investor tour</a><button id="reset-data">↻ Reset demo</button><a class="primary-action" href="profile.html">${initials(session.name)} Profile</a></div></header>
      <div class="page-content" id="page-content">${renderPage()}</div>
    </main>
  </div>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>`;

bindGlobal();
bindPage();

function renderPage() {
  if (page === "dashboard") return renderDashboard();
  if (page === "academics") return renderAcademics();
  if (page === "attendance") return renderAttendance();
  if (page === "lessons") return renderLessons();
  if (page === "assignments") return renderAssignments();
  if (page === "assessments") return renderAssessments();
  if (page === "results") return renderResults();
  if (page === "communications") return renderCommunications();
  if (page === "support") return renderSupport();
  return renderProfile();
}

function intro(eyebrow, title, copy, action = "") {
  return `<section class="page-intro"><div><span class="eyebrow">${eyebrow}</span><h2>${title}</h2><p>${copy}</p></div>${action}</section>`;
}

function stats(items) {
  const colors = ["", "green", "amber", "blue"];
  return `<section class="stats">${items.map((item, index) => `<article class="stat-card"><span class="stat-symbol ${colors[index]}">${item[0]}</span><div><b>${item[1]}</b><small>${item[2]}</small><em>${item[3]}</em></div></article>`).join("")}</section>`;
}

function renderDashboard() {
  if (session.role === "admin") return `${intro("School overview", "Good morning, Itunu.", "Here is what is happening across Pottersville today.", `<a class="button primary" href="academics.html">＋ Add school record</a>`)}
    ${stats([["♙",428,"Active students","↑ 12 this term"],["✓","94%","Attendance today","↑ 2.4% this week"],["▤",36,"Results to approve","3 classes ready"],["◎",18,"Teachers online","4 lessons active"]])}
    <section class="grid-2"><article class="card"><div class="card-head"><div><h3>Weekly attendance</h3><p>Whole-school daily rate</p></div><span class="pill green">Healthy</span></div><div class="activity-bars"><span style="height:72%"><small>Mon</small></span><span style="height:81%"><small>Tue</small></span><span style="height:77%"><small>Wed</small></span><span class="highlight" style="height:94%"><small>Thu</small></span><span style="height:87%"><small>Fri</small></span></div></article><article class="card"><div class="card-head"><div><h3>Approval queue</h3><p>Ready for administrator review</p></div><span class="pill amber">3 classes</span></div><div class="simple-list"><article><span class="list-symbol">B</span><div><b>Biology · SS 1B</b><small>28 results submitted</small></div><em>Review</em></article><article><span class="list-symbol">M</span><div><b>Mathematics · JSS 3A</b><small>30 results submitted</small></div><em>Review</em></article><article><span class="list-symbol">E</span><div><b>English · JSS 2A</b><small>32 results submitted</small></div><em>Review</em></article></div></article></section>`;
  if (session.role === "teacher") return `${intro("Teaching workspace", "Good morning, Faith.", "Your lessons, learners, and next actions are ready.", `<a class="button primary" href="lessons.html">＋ Upload lesson note</a>`)}
    ${stats([["♙",90,"My students","3 assigned classes"],["✓","92%","Class attendance","Today"],["□",14,"Submissions to grade","2 due today"],["◎",3,"Lessons today","Next at 10:30"]])}
    <section class="grid-2"><article class="card"><div class="card-head"><div><h3>Today’s teaching schedule</h3><p>${today()}</p></div><span class="pill green">On track</span></div><div class="schedule"><article><time>08:15</time><i></i><div><b>Basic Science</b><small>JSS 2A · Science Lab</small></div><span class="pill green">Done</span></article><article class="current"><time>10:30</time><i></i><div><b>Biology</b><small>SS 1B · Room 12</small></div><span class="pill">Next</span></article><article><time>13:20</time><i></i><div><b>Agricultural Science</b><small>JSS 3A · School Farm</small></div><span class="pill amber">Later</span></article></div></article><article class="card"><div class="card-head"><div><h3>Quick actions</h3><p>Continue your school day</p></div></div><div class="simple-list"><article><span class="list-symbol">▤</span><div><b>Publish lesson note</b><small>PDF resources for students</small></div><a href="lessons.html"><em>Open →</em></a></article><article><span class="list-symbol">✎</span><div><b>Create an assessment</b><small>Quiz or examination</small></div><a href="assessments.html"><em>Open →</em></a></article><article><span class="list-symbol">↗</span><div><b>Enter student scores</b><small>CA and examination marks</small></div><a href="results.html"><em>Open →</em></a></article></div></article></section>`;
  const latest = data.attempts.at(-1);
  return `${intro("Student workspace · SS 1B", "Welcome back, Amara.", "Stay focused—your learning and progress are all in one place.", `<a class="button primary" href="assessments.html">Take today’s quiz →</a>`)}
    ${stats([["◎","94%","Attendance","This term"],["↗","78%","Current average","↑ 4% this month"],["□",2,"Assignments due","Next due Friday"],["✎",latest ? `${latest.percentage}%` : 1,latest ? "Latest quiz score" : "Quiz available",latest ? "Biology" : "Biology · 10 min"]])}
    <section class="grid-2"><article class="card"><div class="card-head"><div><h3>My school day</h3><p>Your timetable at a glance</p></div><span class="pill green">All caught up</span></div><div class="schedule"><article><time>08:15</time><i></i><div><b>Mathematics</b><small>Room 12 · Mr Adeyemi</small></div><span class="pill green">Done</span></article><article class="current"><time>10:30</time><i></i><div><b>Biology</b><small>Science Lab · Mrs Faith</small></div><span class="pill">Now</span></article><article><time>12:10</time><i></i><div><b>English Language</b><small>Room 12 · Mrs James</small></div><span class="pill amber">Later</span></article></div></article><article class="card"><div class="card-head"><div><h3>Recent achievement</h3><p>Keep the momentum going</p></div></div><div class="empty"><span>★</span><b>Great improvement!</b><p>Your Biology average increased by 8% this month.</p><em class="pill green">Top 20% of your class</em></div></article></section>`;
}

function renderAcademics() {
  return `${intro("Academic foundation", "Configure the school once.", "Shared records power attendance, learning, assessment, and student reporting.", `<button class="button primary" id="load-demo">✦ Refresh investor demo data</button>`)}
    <section class="notice"><span>✦</span><b>Investor demo data is loaded.</b> Refreshing restores any missing sample records without duplicating them.</section>
    <div class="setup-actions"><button data-modal-action="session"><i>◷</i><b>Academic session</b><small>${data.session.name}</small></button><button data-modal-action="class"><i>◎</i><b>Classes & arms</b><small>${data.classes.length} configured</small></button><button data-modal-action="subject"><i>▤</i><b>Subjects</b><small>${data.subjects.length} configured</small></button><button data-modal-action="account"><i>♙</i><b>School accounts</b><small>428 students · 24 staff</small></button></div>
    <section class="grid-2 equal"><form class="form-card" id="class-form"><h3>Add a class</h3><p>Create another class or arm for the school.</p><div class="form-grid"><label class="field">Class name<input name="name" required placeholder="SS 2A"></label><label class="field">Level<input name="level" required placeholder="SS 2"></label><label class="field">Capacity<input name="students" type="number" min="1" max="100" value="30"></label><label class="field">Form teacher<input name="teacher" placeholder="Teacher name"></label></div><div class="form-actions"><button class="button primary">＋ Create class</button></div></form><form class="form-card" id="subject-form"><h3>Add a subject</h3><p>Make a subject available across teaching workflows.</p><div class="form-grid"><label class="field full">Subject name<input name="subject" required placeholder="Computer Science"></label><label class="field">Code<input name="code" required placeholder="CSC"></label><label class="field">Department<select name="department"><option>Science</option><option>Languages</option><option>Humanities</option><option>Vocational</option></select></label></div><div class="form-actions"><button class="button primary">＋ Add subject</button></div></form></section>
    <section class="card" style="margin-top:12px"><div class="card-head"><div><h3>Configured classes</h3><p>Live school structure for ${data.session.term}</p></div><span class="pill">${data.classes.length} records</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Class</th><th>Level</th><th>Students</th><th>Form teacher</th><th>Status</th></tr></thead><tbody>${data.classes.map(item => `<tr><td><strong>${esc(item.name)}</strong><small>Academic class</small></td><td>${esc(item.level)}</td><td>${item.students}</td><td>${esc(item.teacher || "Unassigned")}</td><td><span class="status">Active</span></td></tr>`).join("")}</tbody></table></div></section>`;
}

function renderAttendance() {
  if (session.role === "student") {
    const history = [["16 Jul","Present"],["15 Jul","Present"],["14 Jul","Late"],["13 Jul","Present"],["10 Jul","Present"],["09 Jul","Absent"]];
    return `${intro("My attendance", "A clear record of every school day.", "Attendance is published after the class register is saved.", `<button class="button" onclick="window.print()">Print history</button>`)}${stats([["◎","94%","Attendance rate","This term"],["✓",62,"Days present","Published records"],["◷",2,"Late arrivals","This term"],["×",4,"Days absent","This term"]])}<section class="card" style="margin-top:12px"><div class="card-head"><div><h3>Attendance history</h3><p>Latest school day first</p></div><span class="pill green">Good standing</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Date</th><th>Status</th><th>Recorded by</th><th>Note</th></tr></thead><tbody>${history.map(row => `<tr><td><strong>${row[0]} 2026</strong></td><td><span class="status ${row[1].toLowerCase()}">${row[1]}</span></td><td>Akinkugbe Faith</td><td>${row[1] === "Late" ? "Arrived 08:17" : row[1] === "Absent" ? "Excused absence" : "—"}</td></tr>`).join("")}</tbody></table></div></section>`;
  }
  const present = Object.values(data.attendance).filter(value => value === "present").length;
  const late = Object.values(data.attendance).filter(value => value === "late").length;
  const absent = Object.values(data.attendance).filter(value => value === "absent").length;
  return `${intro("Daily register", "Mark student attendance.", "The saved register updates dashboards and student attendance history.", `<button class="button primary" id="save-attendance">✓ Save class register</button>`)}
    <section class="notice success"><span>✓</span><span>SS 1B register · ${present} present · ${late} late · ${absent} absent</span><button title="Dismiss">×</button></section>
    ${stats([["♙",data.students.length,"Students","SS 1B register"],["✓",present,"Present","Included in attendance rate"],["◷",late,"Late","Present after arrival"],["×",absent,"Absent","Requires follow-up"]])}
    <section class="card" style="margin-top:12px"><div class="card-head"><div><h3>SS 1B · ${today()}</h3><p>Choose a status for every student</p></div><div class="attendance-controls"><select><option>SS 1B</option><option>JSS 3A</option><option>JSS 2A</option></select><input type="date" value="2026-07-16"></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Student</th><th>School ID</th><th>Status</th><th>Note</th></tr></thead><tbody>${data.students.map(([name,id]) => `<tr><td><strong>${name}</strong><small>SS 1B student</small></td><td>${id}</td><td><div class="attendance-toggle" data-student="${id}">${["present","late","absent"].map(status => `<button type="button" class="${data.attendance[id] === status ? `active ${status}` : ""}" data-status="${status}">${status[0].toUpperCase()+status.slice(1)}</button>`).join("")}</div></td><td>${data.attendance[id] === "late" ? "Arrived 08:17" : data.attendance[id] === "absent" ? "Awaiting parent note" : "—"}</td></tr>`).join("")}</tbody></table></div></section>`;
}

function renderLessons() {
  const canPublish = session.role !== "student";
  return `${intro("Learning resources", canPublish ? "Publish lesson notes for every class." : "Everything you need for today’s lessons.", canPublish ? "Upload a PDF, choose the class and topic, then publish it to students." : "View, print, and revise from resources your teachers have published.", canPublish ? `<button class="button primary" id="show-upload">＋ Upload lesson note</button>` : "")}
    ${canPublish ? `<form class="form-card" id="lesson-form"><h3>Upload a lesson note</h3><p>This demo stores the note metadata in your browser and simulates PDF publishing.</p><div class="form-grid three"><label class="field">Title<input name="title" required placeholder="Lesson title"></label><label class="field">Subject<select name="subject">${data.subjects.map(item => `<option>${esc(item)}</option>`).join("")}</select></label><label class="field">Class<select name="className">${data.classes.map(item => `<option>${esc(item.name)}</option>`).join("")}</select></label><label class="field">Week<input name="week" type="number" min="1" max="14" value="5"></label><label class="field full">PDF document<input name="file" type="file" accept="application/pdf" required></label></div><div class="form-actions"><button class="button primary">Publish lesson note</button></div></form>` : ""}
    <section class="resource-grid" style="margin-top:12px">${data.lessons.filter(item => session.role !== "student" || item.className === "SS 1B").map((item,index) => `<article class="resource-card"><span class="resource-file ${index===1?"gold":index===2?"green":""}">PDF</span><small>${esc(item.subject.toUpperCase())} · WEEK ${item.week}</small><h3>${esc(item.title)}</h3><p>Published for ${esc(item.className)} by ${esc(item.teacher)}.</p><div class="resource-meta"><span>${esc(item.file)}</span><span>${item.published ? "Published" : "Draft"}</span></div><a class="button" href="lesson-note.html" target="_blank" rel="noopener">View, download & print</a></article>`).join("")}</section>`;
}

function renderAssignments() {
  if (session.role === "student") {
    return `${intro("My assignments", "Stay on top of every task.", "Submit written work and see teacher feedback from one place.")}<section class="assignment-board">${data.assignments.map(item => { const submission = data.submissions.find(row => row.assignmentId === item.id && row.student === session.name); return `<article class="assignment-card"><small>${esc(item.subject.toUpperCase())} · ${esc(item.className)}</small><h3>${esc(item.title)}</h3><p>${submission ? esc(submission.content) : "Complete the task and submit your response before the deadline."}</p><div class="assignment-meta"><span>Due ${item.due}</span><span>${item.maxScore} marks</span></div>${submission ? `<span class="pill ${submission.score === null ? "amber" : "green"}" style="margin-top:auto;align-self:flex-start">${submission.score === null ? "Submitted · awaiting grade" : `${submission.score}/${item.maxScore} · graded`}</span>` : `<button class="button primary submit-assignment" data-id="${item.id}">Submit response</button>`}</article>`; }).join("")}</section><form class="form-card" id="submission-form" style="margin-top:12px;display:none"><h3>Submit assignment</h3><p id="submission-title">Your response will be saved to this demonstration browser.</p><input type="hidden" name="assignmentId"><label class="field">Written response<textarea name="content" required placeholder="Write or paste your response here"></textarea></label><div class="form-actions"><button class="button primary">Send to teacher</button></div></form>`;
  }
  return `${intro("Teaching workflow", "Create, collect, and grade assignments.", "Published work appears immediately in the student workspace.", `<button class="button primary" id="focus-assignment">＋ Create assignment</button>`)}<section class="grid-2 equal"><form class="form-card" id="assignment-form"><h3>Create an assignment</h3><p>Publish a task for a selected class.</p><div class="form-grid"><label class="field full">Title<input name="title" required placeholder="Assignment title"></label><label class="field">Subject<select name="subject">${data.subjects.map(item=>`<option>${esc(item)}</option>`).join("")}</select></label><label class="field">Class<select name="className">${data.classes.map(item=>`<option>${esc(item.name)}</option>`).join("")}</select></label><label class="field">Due date<input name="due" type="date" required value="2026-07-24"></label><label class="field">Maximum score<input name="maxScore" type="number" min="1" value="20"></label></div><div class="form-actions"><button class="button primary">Publish assignment</button></div></form><section class="card"><div class="card-head"><div><h3>Submission inbox</h3><p>Review and return feedback</p></div><span class="pill amber">${data.submissions.filter(item=>item.score===null).length} awaiting grade</span></div><div class="simple-list">${data.submissions.map(item=>{const assignment=data.assignments.find(row=>row.id===item.assignmentId);return `<article><span class="list-symbol">AO</span><div><b>${esc(item.student)} · ${esc(assignment?.title || "Assignment")}</b><small>${esc(item.content)}</small></div>${item.score===null?`<button class="button grade-submission" data-id="${item.assignmentId}">Grade</button>`:`<span class="pill green">${item.score}/${assignment?.maxScore}</span>`}</article>`}).join("")}</div></section></section><section class="card" style="margin-top:12px"><div class="card-head"><div><h3>Published assignments</h3><p>${data.assignments.length} active class tasks</p></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Assignment</th><th>Subject</th><th>Class</th><th>Due</th><th>Marks</th><th>Status</th></tr></thead><tbody>${data.assignments.map(item=>`<tr><td><strong>${esc(item.title)}</strong></td><td>${esc(item.subject)}</td><td>${esc(item.className)}</td><td>${item.due}</td><td>${item.maxScore}</td><td><span class="status">Published</span></td></tr>`).join("")}</tbody></table></div></section>`;
}

function renderAssessments() {
  if (session.role === "student") return `${intro("Biology knowledge check", "Take your available quiz.", "Submit all three questions to receive your score immediately.")}<section class="quiz-shell"><div class="quiz-top"><b>Cell Structure and Organisation</b><span>● 10:00 remaining</span></div><form id="quiz-form"><section class="question"><h3><span>01</span>Which structure controls the activities of a cell?</h3>${["Cell wall","Nucleus","Vacuole","Cytoplasm"].map((option,index)=>`<label><input type="radio" name="q1" value="${index}">${option}</label>`).join("")}</section><section class="question"><h3><span>02</span>Which organelle is responsible for photosynthesis?</h3>${["Chloroplast","Ribosome","Mitochondrion","Nucleus"].map((option,index)=>`<label><input type="radio" name="q2" value="${index}">${option}</label>`).join("")}</section><section class="question"><h3><span>03</span>The basic unit of life is the:</h3>${["Tissue","Organ","Cell","System"].map((option,index)=>`<label><input type="radio" name="q3" value="${index}">${option}</label>`).join("")}</section><div class="quiz-submit"><p id="quiz-message">Answer every question before submitting.</p><button class="button primary">Submit and score instantly →</button></div></form><div class="score-result" id="score-result"><span>★</span><div><small>YOUR SCORE IS READY</small><h3 id="score-title"></h3><p id="score-copy"></p></div><button class="button" id="retry-quiz">Try again</button></div></section>`;
  return `${intro("Assessment studio", "Create quizzes and examinations.", "Upload questions and answers, schedule attempts, and mark objective questions automatically.", `<button class="button primary" id="focus-assessment">＋ Create assessment</button>`)}<section class="grid-2 equal"><form class="form-card" id="assessment-form"><h3>Create an assessment</h3><p>Configure a timed quiz or examination for a class.</p><div class="form-grid"><label class="field full">Title<input name="title" required placeholder="Week 5 Biology quiz"></label><label class="field">Type<select name="type"><option>Quiz</option><option>Examination</option></select></label><label class="field">Class<select name="className"><option>SS 1B</option><option>JSS 3A</option><option>JSS 2A</option></select></label><label class="field">Duration<input name="duration" type="number" min="5" value="10"></label><label class="field">Attempt limit<input name="attempts" type="number" min="1" value="1"></label><label class="field full">Questions and answers<input name="questions" type="file" accept=".csv,.xlsx" required></label></div><div class="form-actions"><button class="button primary">Publish assessment</button></div></form><article class="card"><div class="card-head"><div><h3>Live assessment</h3><p>Objective marking is enabled</p></div><span class="pill green">Published</span></div><div class="empty"><span>✎</span><b>Biology knowledge check</b><p>SS 1B · 3 questions · 10 minutes · one attempt</p><span class="pill">${data.attempts.length} student attempt${data.attempts.length===1?"":"s"}</span></div></article></section><section class="card" style="margin-top:12px"><div class="card-head"><div><h3>Assessment results</h3><p>Scores become available as soon as students submit</p></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Student</th><th>Assessment</th><th>Score</th><th>Percentage</th><th>Outcome</th></tr></thead><tbody>${data.attempts.length?data.attempts.map(item=>`<tr><td><strong>${esc(item.student)}</strong></td><td>Biology knowledge check</td><td>${item.score}/3</td><td>${item.percentage}%</td><td><span class="status ${item.percentage<50?"absent":""}">${item.percentage>=50?"Passed":"Review needed"}</span></td></tr>`).join(""):`<tr><td colspan="5">No student attempts yet. Sign in as the student to take the quiz.</td></tr>`}</tbody></table></div></section>`;
}

function renderResults() {
  if (session.role === "student") return `${intro("First Term report", "Your academic progress at a glance.", data.resultsApproved ? "This report card has been approved and published by the school." : "Your results are awaiting administrator approval.", `<button class="button primary" onclick="window.print()">Print report card</button>`)}${reportSummary()}${resultTable(false)}`;
  if (session.role === "admin") return `${intro("Approval workflow", "Review and publish student results.", "Approved report cards become visible in the student workspace.", `<button class="button primary" id="approve-results">${data.resultsApproved ? "✓ Results approved" : "Approve SS 1B results"}</button>`)}<section class="notice ${data.resultsApproved?"success":"warning"}"><span>${data.resultsApproved?"✓":"!"}</span><span>${data.resultsApproved?"SS 1B First Term reports are published to students.":"SS 1B results are complete and waiting for administrator approval."}</span></section>${reportSummary()}${resultTable(false)}`;
  return `${intro("Score entry", "Enter CA and examination scores.", "Totals and grades calculate automatically before administrator approval.", `<button class="button primary" id="save-results">✓ Save scores</button>`)}<section class="notice"><span>↗</span><span>SS 1B · Amara Okafor · ${data.session.term}</span></section>${reportSummary()}${resultTable(true)}`;
}

function reportSummary() { const average=Math.round(data.results.reduce((sum,item)=>sum+item.ca+item.exam,0)/data.results.length); return `<section class="result-summary"><div class="result-student"><span>AO</span><div><small>STUDENT REPORT · ${data.session.term.toUpperCase()}</small><h3>Amara Okafor</h3><p>SS 1B · ${data.session.name} Academic Session</p></div></div><div class="result-metrics"><span><small>Average</small><b>${average}%</b></span><span><small>Position</small><b>6<sup>th</sup></b></span><span><small>Attendance</small><b>94%</b></span></div></section>`; }
function resultTable(editable) { return `<section class="table-wrap"><table class="data-table"><thead><tr><th>Subject</th><th>Teacher</th><th>CA / 40</th><th>Exam / 60</th><th>Total</th><th>Grade</th></tr></thead><tbody>${data.results.map((item,index)=>{const total=item.ca+item.exam;return `<tr><td><strong>${esc(item.subject)}</strong></td><td>${esc(item.teacher)}</td><td>${editable?`<input class="table-input result-input" data-index="${index}" data-field="ca" type="number" min="0" max="40" value="${item.ca}">`:item.ca}</td><td>${editable?`<input class="table-input result-input" data-index="${index}" data-field="exam" type="number" min="0" max="60" value="${item.exam}">`:item.exam}</td><td><strong data-total="${index}">${total}</strong></td><td><span class="grade ${grade(total).toLowerCase()}">${grade(total)}</span></td></tr>`}).join("")}</tbody></table></section>`; }

function renderCommunications() {
  const canPublish=session.role!=="student";
  return `${intro("School communication", canPublish?"Keep everyone informed.":"Your school and class updates.", canPublish?"Publish announcements to the whole school or one class.":"Important messages and upcoming events appear here.", canPublish?`<button class="button primary" id="focus-announcement">＋ Publish announcement</button>`:"")}${canPublish?`<section class="grid-2 equal"><form class="form-card" id="announcement-form"><h3>Publish an announcement</h3><p>The update appears immediately in the selected audience’s feed.</p><div class="form-grid"><label class="field full">Title<input name="title" required placeholder="Important school update"></label><label class="field full">Message<textarea name="body" required placeholder="Write a clear announcement"></textarea></label><label class="field">Audience<select name="audience"><option>Everyone</option><option>Students</option><option>Teachers</option><option>SS 1B</option></select></label><label class="field">Priority<select><option>Normal</option><option>Important</option><option>Urgent</option></select></label></div><div class="form-actions"><button class="button primary">Publish update</button></div></form><article class="card"><div class="card-head"><div><h3>Upcoming event</h3><p>School calendar</p></div><span class="pill amber">24 July</span></div><div class="empty"><span>◉</span><b>Inter-house Sports Day</b><p>Main field · 10:00–16:00 · All students and staff</p><span class="pill">8 days away</span></div></article></section>`:""}<section class="card" style="margin-top:12px"><div class="card-head"><div><h3>Latest announcements</h3><p>Published school and class messages</p></div><span class="pill">${data.announcements.length} updates</span></div><div>${data.announcements.map(item=>`<article class="announcement"><span>◉</span><div><h3>${esc(item.title)}</h3><p>${esc(item.body)}</p><small>${esc(item.audience)} · ${esc(item.author)}</small></div><time>${esc(item.date)}</time></article>`).join("")}</div></section>`;
}

function renderSupport() {
  return `${intro("Help centre", "How can we help?", "Submit a demonstration support request and track its status.")}<section class="grid-2 equal"><form class="form-card" id="ticket-form"><h3>Submit a support ticket</h3><p>The request is saved to your local demonstration session.</p><div class="form-grid"><label class="field full">Subject<input name="subject" required placeholder="What do you need help with?"></label><label class="field">Category<select name="category"><option>Portal access</option><option>Assessments</option><option>Results</option><option>Attendance</option><option>General</option></select></label><label class="field">Priority<select><option>Normal</option><option>Low</option><option>High</option></select></label><label class="field full">Message<textarea name="message" required placeholder="Describe the issue clearly"></textarea></label></div><div class="form-actions"><button class="button primary">Send support request</button></div></form><section class="card"><div class="card-head"><div><h3>${session.role==="admin"?"School support queue":"My support tickets"}</h3><p>Track requests to resolution</p></div><span class="pill amber">${data.tickets.filter(item=>item.status!=="resolved").length} open</span></div><div>${data.tickets.filter(item=>session.role==="admin"||item.owner===session.name).map(item=>`<article class="ticket"><span>?</span><div><h3>${esc(item.subject)}</h3><p>${esc(item.message)}</p><small>${esc(item.category)} · ${esc(item.owner)}</small></div><span class="status ${item.status==="resolved"?"":"pending"}">${item.status}</span></article>`).join("")||`<div class="empty"><span>✓</span><b>No support tickets</b><p>New requests will appear here.</p></div>`}</div></section></section>`;
}

function renderProfile() {
  return `${intro("Verified demonstration account", "My school profile.", "Account information used across this role workspace.")}<section class="card profile-card"><div class="profile-hero"></div><div class="profile-body"><span class="profile-avatar">${initials(session.name)}</span><div class="profile-name"><span class="eyebrow">${roleName(session.role)} account</span><h2>${esc(session.name)}</h2><p>Active demonstration access · Signed in for this browser session</p></div><div class="profile-details"><article><small>Approved email</small><b>${esc(session.email)}</b></article><article><small>School</small><b>Pottersville School, New Oko Oba</b></article><article><small>Class or workspace</small><b>${esc(session.className)}</b></article><article><small>Account status</small><b>Active · Demo environment</b></article><article><small>Academic session</small><b>${data.session.name}</b></article><article><small>Current term</small><b>${data.session.term}</b></article></div><div class="form-actions"><a class="button" href="investor-tour.html">View investor tour</a><button class="button danger" id="profile-logout">Sign out</button></div></div></section>`;
}

function bindGlobal() {
  const logout=()=>{sessionStorage.removeItem("pottersville-demo-session");window.location.assign("index.html")};
  document.getElementById("logout").addEventListener("click",logout);
  document.getElementById("reset-data").addEventListener("click",()=>{localStorage.removeItem("pottersville-demo-data");data=clone(DEFAULT_DATA);toast("Demo data restored to its original state.");window.setTimeout(()=>window.location.reload(),600)});
  const sidebar=document.getElementById("sidebar"),backdrop=document.getElementById("mobile-backdrop");
  document.getElementById("mobile-menu").addEventListener("click",()=>{sidebar.classList.add("open");backdrop.classList.add("show")});
  backdrop.addEventListener("click",()=>{sidebar.classList.remove("open");backdrop.classList.remove("show")});
  document.querySelectorAll(".notice button").forEach(button=>button.addEventListener("click",()=>button.closest(".notice").remove()));
  document.getElementById("profile-logout")?.addEventListener("click",logout);
}

function bindPage() {
  document.getElementById("load-demo")?.addEventListener("click",()=>{data=clone(DEFAULT_DATA);saveData();toast("Investor demo data refreshed successfully.");window.setTimeout(()=>window.location.reload(),600)});
  document.getElementById("class-form")?.addEventListener("submit",event=>{event.preventDefault();const f=new FormData(event.currentTarget);data.classes.push({id:Date.now(),name:f.get("name").trim(),level:f.get("level").trim(),students:Number(f.get("students"))||30,teacher:f.get("teacher").trim()||"Unassigned"});saveData();toast("Class created and added to academic records.");window.setTimeout(()=>window.location.reload(),500)});
  document.getElementById("subject-form")?.addEventListener("submit",event=>{event.preventDefault();const f=new FormData(event.currentTarget);data.subjects.push(f.get("subject").trim());saveData();toast("Subject added to the school curriculum.");event.currentTarget.reset()});
  document.querySelectorAll("[data-modal-action]").forEach(button=>button.addEventListener("click",()=>toast(`${button.querySelector("b").textContent} is fully configured for this demo.`)));
  document.querySelectorAll(".attendance-toggle button").forEach(button=>button.addEventListener("click",()=>{const group=button.closest(".attendance-toggle");group.querySelectorAll("button").forEach(item=>item.className="");button.className=`active ${button.dataset.status}`;data.attendance[group.dataset.student]=button.dataset.status}));
  document.getElementById("save-attendance")?.addEventListener("click",()=>{data.attendanceSavedAt=new Date().toISOString();saveData();toast("SS 1B attendance register saved.")});
  document.getElementById("lesson-form")?.addEventListener("submit",event=>{event.preventDefault();const f=new FormData(event.currentTarget),file=f.get("file");data.lessons.unshift({id:Date.now(),subject:f.get("subject"),className:f.get("className"),week:Number(f.get("week")),title:f.get("title").trim(),teacher:session.name,file:file.name,published:true});saveData();toast("Lesson note published to the student workspace.");window.setTimeout(()=>window.location.reload(),550)});
  document.getElementById("show-upload")?.addEventListener("click",()=>document.getElementById("lesson-form")?.scrollIntoView({behavior:"smooth"}));
  document.getElementById("assignment-form")?.addEventListener("submit",event=>{event.preventDefault();const f=new FormData(event.currentTarget);data.assignments.unshift({id:Date.now(),title:f.get("title").trim(),subject:f.get("subject"),className:f.get("className"),due:f.get("due"),maxScore:Number(f.get("maxScore")),status:"published"});saveData();toast("Assignment published to students.");window.setTimeout(()=>window.location.reload(),550)});
  document.getElementById("focus-assignment")?.addEventListener("click",()=>document.getElementById("assignment-form")?.scrollIntoView({behavior:"smooth"}));
  document.querySelectorAll(".submit-assignment").forEach(button=>button.addEventListener("click",()=>{const form=document.getElementById("submission-form");form.style.display="block";form.assignmentId.value=button.dataset.id;form.scrollIntoView({behavior:"smooth"})}));
  document.getElementById("submission-form")?.addEventListener("submit",event=>{event.preventDefault();const f=new FormData(event.currentTarget);data.submissions.push({assignmentId:Number(f.get("assignmentId")),student:session.name,content:f.get("content").trim(),score:null,feedback:""});saveData();toast("Assignment submitted to your teacher.");window.setTimeout(()=>window.location.reload(),550)});
  document.querySelectorAll(".grade-submission").forEach(button=>button.addEventListener("click",()=>{const item=data.submissions.find(row=>row.assignmentId===Number(button.dataset.id));const assignment=data.assignments.find(row=>row.id===Number(button.dataset.id));const score=Math.max(0,Math.min(assignment.maxScore,Number(window.prompt(`Enter score out of ${assignment.maxScore}`,"18"))||0));item.score=score;item.feedback="Well explained. Keep using accurate scientific terms.";saveData();toast("Grade and feedback returned to the student.");window.setTimeout(()=>window.location.reload(),500)}));
  document.getElementById("assessment-form")?.addEventListener("submit",event=>{event.preventDefault();const f=new FormData(event.currentTarget),file=f.get("questions");toast(`${f.get("title")} published with questions imported from ${file.name}.`);event.currentTarget.reset()});
  document.getElementById("focus-assessment")?.addEventListener("click",()=>document.getElementById("assessment-form")?.scrollIntoView({behavior:"smooth"}));
  document.getElementById("quiz-form")?.addEventListener("submit",event=>{event.preventDefault();const f=new FormData(event.currentTarget);if(!["q1","q2","q3"].every(key=>f.has(key))){const msg=document.getElementById("quiz-message");msg.textContent="Please answer all three questions before submitting.";msg.style.color="#a96f20";return}const score=Number(f.get("q1")==="1")+Number(f.get("q2")==="0")+Number(f.get("q3")==="2"),percentage=Math.round(score/3*100);data.attempts.push({student:session.name,score,percentage,date:new Date().toISOString()});saveData();document.getElementById("score-title").textContent=`${percentage}% · ${percentage>=70?"Excellent work!":percentage>=50?"Good attempt":"Review the lesson note"}`;document.getElementById("score-copy").textContent=`You answered ${score} of 3 questions correctly. Your score was recorded immediately.`;document.getElementById("score-result").classList.add("show");event.currentTarget.querySelector("button").disabled=true});
  document.getElementById("retry-quiz")?.addEventListener("click",()=>{const form=document.getElementById("quiz-form");form.reset();form.querySelector("button").disabled=false;document.getElementById("score-result").classList.remove("show")});
  document.querySelectorAll(".result-input").forEach(input=>input.addEventListener("input",()=>{const index=Number(input.dataset.index),ca=Number(document.querySelector(`[data-index="${index}"][data-field="ca"]`).value),exam=Number(document.querySelector(`[data-index="${index}"][data-field="exam"]`).value);document.querySelector(`[data-total="${index}"]`).textContent=ca+exam}));
  document.getElementById("save-results")?.addEventListener("click",()=>{document.querySelectorAll(".result-input").forEach(input=>{data.results[Number(input.dataset.index)][input.dataset.field]=Number(input.value)});data.resultsApproved=false;saveData();toast("Scores saved and sent for administrator approval.")});
  document.getElementById("approve-results")?.addEventListener("click",()=>{data.resultsApproved=true;saveData();toast("SS 1B report cards approved and published.");window.setTimeout(()=>window.location.reload(),550)});
  document.getElementById("announcement-form")?.addEventListener("submit",event=>{event.preventDefault();const f=new FormData(event.currentTarget);data.announcements.unshift({id:Date.now(),title:f.get("title").trim(),body:f.get("body").trim(),audience:f.get("audience"),author:session.name,date:"Now"});saveData();toast("Announcement published successfully.");window.setTimeout(()=>window.location.reload(),550)});
  document.getElementById("focus-announcement")?.addEventListener("click",()=>document.getElementById("announcement-form")?.scrollIntoView({behavior:"smooth"}));
  document.getElementById("ticket-form")?.addEventListener("submit",event=>{event.preventDefault();const f=new FormData(event.currentTarget);data.tickets.unshift({id:Date.now(),subject:f.get("subject").trim(),category:f.get("category"),message:f.get("message").trim(),status:"open",owner:session.name});saveData();toast("Support request submitted.");window.setTimeout(()=>window.location.reload(),550)});
}

function toast(message,error=false){const element=document.getElementById("toast");element.textContent=`${error?"×":"✓"} ${message}`;element.className=`toast ${error?"error":""} show`;window.clearTimeout(window.toastTimer);window.toastTimer=window.setTimeout(()=>element.classList.remove("show"),3500)}
