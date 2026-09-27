import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const ROOT = process.cwd();
const BASE_URL = process.env.POTTERSVILLE_URL || "https://pottersville-school-demo.netlify.app/";
const OUTPUT_DIR = path.join(ROOT, "artifacts", "demo-video", "raw");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "pottersville-dashboard-walkthrough.webm");
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

await fs.mkdir(OUTPUT_DIR, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: EDGE_PATH,
  args: ["--disable-notifications", "--hide-scrollbars"]
});

const context = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  screen: { width: 1600, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: "light",
  recordVideo: {
    dir: OUTPUT_DIR,
    size: { width: 1600, height: 900 }
  }
});

const page = await context.newPage();
const video = page.video();
page.setDefaultTimeout(20_000);

async function showTitle({ eyebrow, title, copy, badge, duration = 4_000 }) {
  await page.setContent(`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <style>
          *{box-sizing:border-box}
          body{margin:0;min-height:100vh;display:grid;place-items:center;overflow:hidden;background:
            radial-gradient(circle at 15% 20%,rgba(180,132,215,.32),transparent 28%),
            radial-gradient(circle at 85% 80%,rgba(235,181,102,.22),transparent 30%),
            linear-gradient(135deg,#25152f 0%,#45235a 52%,#2b1736 100%);
            color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif}
          body:before,body:after{content:"";position:absolute;border:1px solid rgba(255,255,255,.11);border-radius:50%}
          body:before{width:620px;height:620px;right:-180px;top:-280px}
          body:after{width:470px;height:470px;left:-190px;bottom:-260px}
          .wrap{width:min(1120px,82vw);position:relative;z-index:2}
          .brand{display:flex;align-items:center;gap:18px;margin-bottom:82px;font-size:27px;font-weight:800;letter-spacing:-.5px}
          .mark{display:grid;place-items:center;width:62px;height:62px;border-radius:19px;background:linear-gradient(145deg,#a76bd0,#8150ad);box-shadow:0 18px 50px rgba(11,4,18,.38);font-size:33px}
          .brand small{display:block;margin-top:4px;color:#d8c9e0;font-size:11px;letter-spacing:3px;text-transform:uppercase}
          .eyebrow{margin:0 0 20px;color:#e4c878;font-size:14px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase}
          h1{max-width:980px;margin:0;font-size:68px;line-height:1.04;letter-spacing:-3.3px}
          p{max-width:850px;margin:28px 0 0;color:#ded1e4;font-size:23px;line-height:1.55}
          .badge{display:inline-flex;align-items:center;gap:10px;margin-top:42px;padding:12px 18px;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(255,255,255,.08);font-size:14px;font-weight:700;color:#f7f1f9}
          .badge:before{content:"";width:9px;height:9px;border-radius:50%;background:#62d4a4;box-shadow:0 0 18px #62d4a4}
        </style>
      </head>
      <body>
        <main class="wrap">
          <div class="brand"><span class="mark">✦</span><span>Pottersville<small>School portal</small></span></div>
          <div class="eyebrow">${eyebrow}</div>
          <h1>${title}</h1>
          <p>${copy}</p>
          <span class="badge">${badge}</span>
        </main>
      </body>
    </html>`);
  await wait(duration);
}

async function installVideoLayer() {
  await page.addStyleTag({ content: `
    #ps-video-caption{position:fixed;z-index:2147483645;left:50%;bottom:28px;transform:translateX(-50%);
      width:min(1060px,calc(100vw - 80px));padding:17px 24px 18px;border:1px solid rgba(255,255,255,.19);
      border-radius:18px;background:rgba(38,21,48,.93);box-shadow:0 18px 56px rgba(22,10,29,.3);
      color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif;backdrop-filter:blur(14px);pointer-events:none}
    #ps-video-caption small{display:block;margin-bottom:5px;color:#e4c878;font-size:11px;font-weight:800;
      letter-spacing:1.8px;text-transform:uppercase}
    #ps-video-caption strong{display:block;font-size:18px;line-height:1.38;letter-spacing:-.15px}
    #ps-video-cursor{position:fixed;z-index:2147483647;width:25px;height:25px;border:3px solid #fff;border-radius:50%;
      background:#8d57b3;box-shadow:0 3px 13px rgba(38,21,48,.5);transform:translate(-50%,-50%);
      pointer-events:none;transition:width .12s,height .12s,background .12s}
    #ps-video-cursor.clicking{width:38px;height:38px;background:#e1bd65}
    .ps-video-ripple{position:fixed;z-index:2147483646;width:20px;height:20px;border:3px solid rgba(141,87,179,.72);
      border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;animation:ps-ripple .58s ease-out forwards}
    @keyframes ps-ripple{to{width:72px;height:72px;opacity:0}}
  `});
  await page.evaluate(() => {
    const caption = document.createElement("div");
    caption.id = "ps-video-caption";
    caption.innerHTML = "<small>Pottersville dashboard redesign</small><strong>Connected school operations, teaching, and learning.</strong>";
    document.body.appendChild(caption);

    const cursor = document.createElement("div");
    cursor.id = "ps-video-cursor";
    cursor.style.left = "800px";
    cursor.style.top = "450px";
    document.body.appendChild(cursor);

    window.addEventListener("mousemove", event => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    });
    window.addEventListener("mousedown", event => {
      cursor.classList.add("clicking");
      const ripple = document.createElement("div");
      ripple.className = "ps-video-ripple";
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;
      document.body.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 650);
    });
    window.addEventListener("mouseup", () => cursor.classList.remove("clicking"));
  });
}

async function caption(kicker, text) {
  await page.evaluate(({ kicker, text }) => {
    const el = document.getElementById("ps-video-caption");
    if (el) el.innerHTML = `<small>${kicker}</small><strong>${text}</strong>`;
  }, { kicker, text });
}

async function pointAt(selector) {
  const locator = page.locator(selector).first();
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error(`Element is not visible: ${selector}`);
  const x = box.x + Math.min(box.width * 0.55, box.width - 8);
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y, { steps: 24 });
  await wait(350);
  return { locator, x, y };
}

async function click(selector, settle = 900) {
  const { x, y } = await pointAt(selector);
  await page.mouse.click(x, y);
  await wait(settle);
}

async function navigate(href, kicker, text, dwell = 4_200) {
  const navPromise = page.waitForURL(`**/${href}`, { waitUntil: "networkidle" });
  await click(`a[href="${href}"]`, 200);
  await navPromise;
  await installVideoLayer();
  await caption(kicker, text);
  await wait(dwell);
}

async function login(role, kicker, text) {
  if (!page.url().endsWith("/") && !page.url().endsWith("/index.html")) {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
  }
  await installVideoLayer();
  await caption("Secure role-based access", "Choose an account to enter its purpose-built workspace.");
  await wait(1_400);
  await click(`[data-demo-account="${role}"]`, 1_200);
  await caption(kicker, text);
  await wait(1_500);
  const navPromise = page.waitForURL("**/dashboard.html", { waitUntil: "networkidle" });
  await click(".login-submit", 150);
  await navPromise;
  await installVideoLayer();
}

async function logout() {
  const navPromise = page.waitForURL("**/index.html", { waitUntil: "networkidle" });
  await click("#logout", 150);
  await navPromise;
  await installVideoLayer();
  await wait(700);
}

try {
  await showTitle({
    eyebrow: "Investor product walkthrough",
    title: "A modern school dashboard, built around every role.",
    copy: "See how Pottersville connects administration, teachers, students, learning resources, assessment, and reporting in one easy-to-navigate experience.",
    badge: "Live interactive demonstration",
    duration: 4_600
  });

  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    localStorage.removeItem("pottersville-demo-data");
    sessionStorage.removeItem("pottersville-demo-session");
  });
  await page.reload({ waitUntil: "networkidle" });
  await installVideoLayer();
  await caption("One portal · three tailored experiences", "A clear login page makes the demonstration easy to start and every role easy to explore.");
  await wait(3_800);

  await login("admin", "Administrator access", "Full visibility across school operations, records, attendance, approvals, and reporting.");
  await caption("Administrator dashboard", "Decision-ready summaries surface enrolment, attendance, classes, staffing, and performance at a glance.");
  await wait(4_800);
  await page.evaluate(() => window.scrollTo({ top: 410, behavior: "smooth" }));
  await wait(2_300);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await wait(900);

  await navigate("attendance.html", "Fast daily operations", "Teachers or administrators can mark attendance quickly and save the complete class register.", 2_700);
  await click('[data-student="PVNT018"] [data-status="present"]', 900);
  await click("#save-attendance", 1_700);
  await caption("Attendance saved", "Colour-coded status controls reduce friction while maintaining a clear audit-ready register.");
  await wait(2_300);

  await navigate("results.html", "Result approval workflow", "Administrators review completed scores before publishing report cards to student accounts.", 2_600);
  if (await page.locator("#approve-results").count()) {
    await click("#approve-results", 1_100);
    await page.waitForLoadState("networkidle");
    await installVideoLayer();
    await caption("Published with control", "One approval makes verified report cards available in the student workspace.");
    await wait(3_200);
  }
  await logout();

  await login("teacher", "Teacher access", "Teaching tools stay focused on lessons, assignments, exams, marking, and learner feedback.");
  await caption("Teacher dashboard", "A practical daily workspace brings teaching schedules and common actions together.");
  await wait(4_200);

  await navigate("lessons.html", "PDF lesson notes", "Teachers can upload and publish lesson notes for students to view, download, or print.", 2_300);
  await click("#show-upload", 1_100);
  await page.locator('#lesson-form input[name="title"]').fill("Cell Structure Revision Guide");
  await page.locator('#lesson-form input[name="file"]').setInputFiles({
    name: "Cell-Structure-Revision-Guide.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\n% Pottersville demonstration lesson note\n")
  });
  await caption("Publish in a few steps", "Choose the subject, class, and week, attach a PDF, then publish it directly to learners.");
  await wait(2_200);
  const lessonReload = page.waitForNavigation({ waitUntil: "networkidle" });
  await click("#lesson-form button", 150);
  await lessonReload;
  await installVideoLayer();
  await caption("Lesson note published", "The new PDF is now part of the student learning-resource library.");
  await wait(3_100);

  await navigate("assessments.html", "Quiz and exam authoring", "Teachers can create timed assessments and import question-and-answer files for automatic marking.", 2_300);
  await page.locator('#assessment-form input[name="title"]').fill("SS 1 Biology Mid-Term Examination");
  await page.locator('#assessment-form input[name="questions"]').setInputFiles({
    name: "Biology-Mid-Term-Questions-and-Answers.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("question,option_a,option_b,answer\nBasic unit of life?,Tissue,Cell,Cell\n")
  });
  await caption("Questions and answers included", "CSV or spreadsheet uploads support faster exam setup and objective auto-marking.");
  await wait(2_200);
  await click("#assessment-form button", 1_600);
  await caption("Assessment ready", "Published assessments become available to the right class with timing and attempt controls.");
  await wait(2_700);
  await logout();

  await login("student", "Student access", "A simple student workspace keeps learning resources, tasks, quizzes, scores, and results easy to find.");
  await caption("Student dashboard", "Personal learning priorities and progress are immediately visible without unnecessary complexity.");
  await wait(4_300);

  await navigate("lessons.html", "Learning resources", "Students can find published notes by subject and open them for reading, PDF download, or printing.", 3_400);
  await page.evaluate(() => window.scrollTo({ top: 360, behavior: "smooth" }));
  await wait(1_900);

  await navigate("assessments.html", "Instantly scored quizzes", "Students answer available questions and receive their score as soon as they submit.", 2_400);
  await click('input[name="q1"][value="1"]', 450);
  await click('input[name="q2"][value="0"]', 450);
  await click('input[name="q3"][value="2"]', 650);
  await caption("Ready to submit", "The portal validates every response before securely recording the attempt.");
  await wait(1_500);
  await click("#quiz-form button", 1_300);
  await caption("Immediate feedback", "The learner sees a 100% score instantly, and the attempt is recorded for the teacher.");
  await wait(4_600);

  await navigate("results.html", "Transparent academic progress", "Approved report cards combine subject scores, totals, grades, and printable student records.", 4_000);
  await page.evaluate(() => window.scrollTo({ top: 420, behavior: "smooth" }));
  await wait(2_600);

  await showTitle({
    eyebrow: "Pottersville school portal",
    title: "Ready for a smarter, more connected school experience?",
    copy: "Explore the live demonstration, test all three role-based workspaces, and reach out to schedule a guided product conversation.",
    badge: "pottersville-school-demo.netlify.app",
    duration: 5_400
  });
} finally {
  await context.close();
  await browser.close();
}

const recordedPath = await video.path();
if (path.resolve(recordedPath) !== path.resolve(OUTPUT_FILE)) {
  await fs.rm(OUTPUT_FILE, { force: true });
  await fs.rename(recordedPath, OUTPUT_FILE);
}

console.log(OUTPUT_FILE);
