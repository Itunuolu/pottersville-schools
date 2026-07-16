"use client";

import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  GraduationCap,
  LoaderCircle,
  LockKeyhole,
  Printer,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type LessonNote = {
  id: number;
  title: string;
  description: string;
  subject: string;
  className: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
};

type AssessmentSummary = {
  id: number;
  title: string;
  description: string;
  assessmentType: "quiz" | "exam";
  subject: string;
  className: string;
  durationMinutes: number;
  passMark: number;
  questionCount: number;
};

type AssessmentDetail = Omit<AssessmentSummary, "questionCount"> & {
  questions: { id: number; prompt: string; options: string[]; points: number }[];
};

type ScoreResult = {
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
};

async function readError(response: Response) {
  try { return ((await response.json()) as { error?: string }).error || "Something went wrong."; }
  catch { return "Something went wrong."; }
}

function formatFileSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

type StudentDashboardProps = {
  user: {
    displayName: string;
    email: string;
    role: "student" | "teacher" | "admin";
    className: string | null;
  };
};

export default function StudentDashboard({ user }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<"notes" | "assessments">("notes");
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [notesResponse, assessmentsResponse] = await Promise.all([
          fetch("/api/lesson-notes", { cache: "no-store" }),
          fetch("/api/assessments", { cache: "no-store" }),
        ]);
        if (!notesResponse.ok) throw new Error(await readError(notesResponse));
        if (!assessmentsResponse.ok) throw new Error(await readError(assessmentsResponse));
        setNotes(((await notesResponse.json()) as { notes: LessonNote[] }).notes);
        setAssessments(((await assessmentsResponse.json()) as { assessments: AssessmentSummary[] }).assessments);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "The learning portal could not be loaded.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const submitAssessment = useCallback(async () => {
    if (!assessment || submitting || result) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/assessments/${assessment.id}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!response.ok) throw new Error(await readError(response));
      setResult(((await response.json()) as { result: ScoreResult }).result);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Your answers could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }, [answers, assessment, result, submitting]);

  useEffect(() => {
    if (!assessment || result || timeLeft <= 0) return;
    const timer = window.setInterval(() => setTimeLeft((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [assessment, result, timeLeft]);

  useEffect(() => {
    if (assessment && !result && timeLeft === 0) void submitAssessment();
  }, [assessment, result, submitAssessment, timeLeft]);

  const startAssessment = async (assessmentId: number) => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`/api/assessments/${assessmentId}`, { cache: "no-store" });
      if (!response.ok) throw new Error(await readError(response));
      const detail = ((await response.json()) as { assessment: AssessmentDetail }).assessment;
      setAssessment(detail);
      setAnswers({});
      setQuestionIndex(0);
      setResult(null);
      setTimeLeft(detail.durationMinutes * 60);
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "This assessment could not be opened.");
    } finally {
      setLoading(false);
    }
  };

  const closeAssessment = () => {
    setAssessment(null);
    setAnswers({});
    setResult(null);
    setTimeLeft(0);
    setQuestionIndex(0);
  };

  const currentQuestion = assessment?.questions[questionIndex];
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const initials = user.displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "PS";
  const canTakeAssessments = user.role === "student";

  return (
    <div className="student-app">
      <header className="student-topbar">
        <a className="student-brand" href="/"><span><Sparkles size={18} /></span><strong>PurpleStars<small>Student learning portal</small></strong></a>
        <div className="student-account"><a className="student-avatar-link" href="/profile">{initials}</a><div><strong>{user.displayName}</strong><small>{user.role === "student" ? `${user.className || "Class pending"} · Student` : `${user.role} preview`}</small></div><a href="/signout-with-chatgpt?return_to=%2Flogin">Sign out</a></div>
      </header>

      <main className="student-main">
        <a className="back-to-dashboard" href="/"><ArrowLeft size={14} />Back to my dashboard</a>
        <section className="student-hero">
          <div><p className="eyebrow">Learning portal</p><h1>Learn. Practise. Improve.</h1><p>Download lesson notes, take assessments, and see your progress instantly.</p></div>
          <div className="student-hero-stats"><div><BookOpen size={18} /><strong>{notes.length}</strong><span>Lesson notes</span></div><div><GraduationCap size={19} /><strong>{assessments.length}</strong><span>Active assessments</span></div></div>
        </section>

        <nav className="student-tabs" aria-label="Learning sections">
          <button className={activeTab === "notes" ? "active" : ""} type="button" onClick={() => setActiveTab("notes")}><BookOpen size={16} />Lesson notes<span>{notes.length}</span></button>
          <button className={activeTab === "assessments" ? "active" : ""} type="button" onClick={() => setActiveTab("assessments")}><GraduationCap size={17} />Quizzes & exams<span>{assessments.length}</span></button>
        </nav>
        <a className="student-operations-link" href="/operations"><Sparkles size={16} /><span><strong>Open my complete school workspace</strong><small>Attendance, assignments, report cards, announcements and support</small></span><ArrowLeft className="forward" size={15} /></a>

        {error && <div className="student-error" role="alert"><X size={16} />{error}<button type="button" onClick={() => setError("")}>Dismiss</button></div>}

        {loading && !assessment ? <div className="student-loading"><LoaderCircle className="spin" size={24} /><span>Loading your learning materials…</span></div> : activeTab === "notes" ? (
          <section className="student-content" aria-labelledby="student-notes-title">
            <div className="student-section-head"><div><h2 id="student-notes-title">Lesson notes</h2><p>PDF resources shared by your teachers.</p></div><span>Newest first</span></div>
            <div className="resource-grid">
              {notes.map((note) => (
                <article className="resource-card" key={note.id}>
                  <div className="resource-card-top"><span className="pdf-icon"><FileText size={22} /></span><span className="pdf-badge">PDF</span></div>
                  <span className="resource-subject">{note.subject} · {note.className}</span>
                  <h3>{note.title}</h3>
                  <p>{note.description || "A downloadable lesson resource from your teacher."}</p>
                  <div className="resource-meta"><span>{formatFileSize(note.fileSize)}</span><span>{new Date(`${note.createdAt}Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span></div>
                  <div className="resource-actions"><a href={`/api/lesson-notes/${note.id}/file?download=1`}><Download size={15} />Download PDF</a><button type="button" onClick={() => window.open(`/api/lesson-notes/${note.id}/file`, "_blank", "noopener,noreferrer")}><Printer size={15} />Print</button></div>
                </article>
              ))}
              {!notes.length && <div className="student-empty"><BookOpen size={27} /><h3>No lesson notes yet</h3><p>Your teacher’s published PDFs will appear here.</p></div>}
            </div>
          </section>
        ) : (
          <section className="student-content" aria-labelledby="student-assessments-title">
            <div className="student-section-head"><div><h2 id="student-assessments-title">Quizzes & exams</h2><p>Complete each assessment and receive your score immediately.</p></div><span>Auto-graded</span></div>
            <div className="assessment-list">
              {assessments.map((item) => (
                <article className="student-assessment-card" key={item.id}>
                  <span className={`student-assessment-icon ${item.assessmentType}`}><GraduationCap size={21} /></span>
                  <div className="student-assessment-info"><span>{item.assessmentType} · {item.subject}</span><h3>{item.title}</h3><p>{item.description || `A ${item.questionCount}-question assessment for ${item.className}.`}</p></div>
                  <div className="student-assessment-meta"><span><Clock3 size={14} />{item.durationMinutes} min</span><span><FileText size={14} />{item.questionCount} questions</span><span><Trophy size={14} />Pass: {item.passMark}%</span></div>
                  <button className="start-assessment" type="button" disabled={!canTakeAssessments} title={canTakeAssessments ? undefined : "Only student accounts can submit assessments"} onClick={() => canTakeAssessments && void startAssessment(item.id)}>{canTakeAssessments ? `Start ${item.assessmentType}` : "Student preview"}</button>
                </article>
              ))}
              {!assessments.length && <div className="student-empty"><GraduationCap size={28} /><h3>No active assessments</h3><p>Your teacher’s quizzes and exams will appear here.</p></div>}
            </div>
          </section>
        )}
      </main>

      {assessment && currentQuestion && (
        <div className="assessment-player-backdrop">
          <section className="assessment-player" role="dialog" aria-modal="true" aria-labelledby="assessment-player-title">
            <header className="player-header">
              <div><span>{assessment.assessmentType} · {assessment.subject}</span><h2 id="assessment-player-title">{assessment.title}</h2></div>
              {!result && <div className={`player-timer${timeLeft < 60 ? " warning" : ""}`}><Clock3 size={16} /><span>Time left</span><strong>{formatTime(timeLeft)}</strong></div>}
              {result && <button className="player-close" type="button" onClick={closeAssessment} aria-label="Close score"><X size={18} /></button>}
            </header>

            {result ? (
              <div className="score-screen">
                <span className={`score-icon${result.passed ? " passed" : ""}`}>{result.passed ? <Trophy size={31} /> : <GraduationCap size={31} />}</span>
                <p className="eyebrow">Submitted successfully</p>
                <h3>{result.passed ? "Well done!" : "Keep practising."}</h3>
                <p>Your score is ready.</p>
                <div className="score-ring"><strong>{result.percentage}%</strong><span>{result.score} of {result.totalPoints} points</span></div>
                <div className={`result-status${result.passed ? " passed" : ""}`}><CheckCircle2 size={17} />{result.passed ? `Passed · Required ${assessment.passMark}%` : `Not passed · Required ${assessment.passMark}%`}</div>
                <button type="button" onClick={closeAssessment}>Back to assessments</button>
              </div>
            ) : (
              <>
                <div className="player-progress"><span style={{ width: `${((questionIndex + 1) / assessment.questions.length) * 100}%` }} /></div>
                <div className="question-screen">
                  <div className="question-screen-meta"><span>Question {questionIndex + 1} of {assessment.questions.length}</span><span>{currentQuestion.points} {currentQuestion.points === 1 ? "point" : "points"}</span></div>
                  <h3>{currentQuestion.prompt}</h3>
                  <div className="student-answer-options">
                    {currentQuestion.options.map((option, optionIndex) => {
                      const selected = answers[String(currentQuestion.id)] === optionIndex;
                      return <button className={selected ? "selected" : ""} type="button" key={optionIndex} onClick={() => setAnswers((current) => ({ ...current, [String(currentQuestion.id)]: optionIndex }))}><span>{String.fromCharCode(65 + optionIndex)}</span><strong>{option}</strong>{selected && <Check size={18} />}</button>;
                    })}
                  </div>
                </div>
                <footer className="player-footer">
                  <span>{answeredCount} of {assessment.questions.length} answered</span>
                  <div><button type="button" disabled={questionIndex === 0} onClick={() => setQuestionIndex((current) => current - 1)}>Previous</button>{questionIndex < assessment.questions.length - 1 ? <button className="player-primary" type="button" onClick={() => setQuestionIndex((current) => current + 1)}>Next question</button> : <button className="player-primary submit" type="button" disabled={submitting} onClick={() => void submitAssessment()}>{submitting ? <><LoaderCircle className="spin" size={15} />Marking…</> : "Submit answers"}</button>}</div>
                </footer>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
