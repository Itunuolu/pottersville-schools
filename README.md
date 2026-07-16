# PurpleStars School Portal

PurpleStars is a connected school operations platform for administrators, teachers, and students. It brings academic setup, attendance, lesson resources, assignments, assessments, results, communication, and reporting into one role-aware workspace.

**Live investor demo:** [purplestars-school-demo.netlify.app](https://purplestars-school-demo.netlify.app/)

## Investor demonstration application

The public investor application is served from `docs/` and deploys to both Netlify and GitHub Pages. It is a browser-safe demonstration with fictional data and includes:

- a branded sign-in page with administrator, teacher, and student demo accounts;
- separate role-based dashboards and ten navigable portal pages;
- interactive academic setup, attendance, lesson notes, assignments, assessments, results, announcements, support, and profile workflows;
- browser-persistent demonstration records, immediate quiz scoring, and printable lesson notes and report cards.

All demonstration accounts use the password `demo1234`:

- Administrator: `admin@purplestars.demo`
- Teacher: `teacher@purplestars.demo`
- Student: `PSNT016`

The production application in `app/` contains the complete server-backed workflows. GitHub Pages cannot execute its authentication, database, file-storage, or API routes, so the public showcase uses demonstration data only.

## Complete application capabilities

- Role-based administrator, teacher, and student access
- Academic sessions, terms, classes, subjects, teaching assignments, and timetables
- Attendance capture and CSV reporting
- PDF lesson-note upload, publishing, download tracking, and printing
- Assignments, submissions, feedback, and grading
- Quizzes and examinations with CSV/XLSX question import
- Timed attempts, automatic marking, and immediate scores
- Results, grades, report cards, approvals, exports, and print views
- Announcements, events, profiles, ID cards, support tickets, and audit records

## Local development

Requirements: Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

For a production validation build:

```bash
npm run build
```

The full application uses Cloudflare-compatible D1 and R2 bindings declared in `.openai/hosting.json`. Generated database migrations live in `drizzle/`.

## Project structure

- `app/` — application routes, dashboards, and APIs
- `db/` — Drizzle schema
- `drizzle/` — database migrations
- `docs/` — public GitHub Pages investor showcase
- `tests/` — production feature checks

## Security note

All records shown in the public investor showcase are fictional demonstration data. Do not commit real student records, credentials, environment files, or uploaded school documents to the repository.
