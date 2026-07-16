"use client";

import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  GraduationCap,
  LoaderCircle,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";

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

type Assessment = {
  id: number;
  title: string;
  assessmentType: "quiz" | "exam";
  subject: string;
  className: string;
  durationMinutes: number;
  passMark: number;
  questionCount: number;
};

type QuestionDraft = {
  prompt: string;
  options: string[];
  correctOption: number;
  points: number;
};

const newQuestion = (): QuestionDraft => ({
  prompt: "",
  options: ["", "", "", ""],
  correctOption: 0,
  points: 1,
});

function formatFileSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function readError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error || "Something went wrong. Please try again.";
  } catch {
    return "Something went wrong. Please try again.";
  }
}

export function LearningStudio() {
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [questions, setQuestions] = useState<QuestionDraft[]>([newQuestion(), newQuestion()]);

  const loadContent = useCallback(async () => {
    try {
      const [notesResponse, assessmentsResponse] = await Promise.all([
        fetch("/api/lesson-notes", { cache: "no-store" }),
        fetch("/api/assessments", { cache: "no-store" }),
      ]);
      if (notesResponse.ok) setNotes(((await notesResponse.json()) as { notes: LessonNote[] }).notes);
      if (assessmentsResponse.ok) setAssessments(((await assessmentsResponse.json()) as { assessments: Assessment[] }).assessments);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadContent(); }, [loadContent]);

  const showMessage = (tone: "success" | "error", text: string) => {
    setMessage({ tone, text });
    window.setTimeout(() => setMessage(null), 5000);
  };

  const uploadLessonNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/lesson-notes", { method: "POST", body: new FormData(form) });
      if (!response.ok) throw new Error(await readError(response));
      form.reset();
      setUploadOpen(false);
      showMessage("success", "Lesson note published. Students can now download or print it.");
      await loadContent();
    } catch (error) {
      showMessage("error", error instanceof Error ? error.message : "The lesson note could not be uploaded.");
    } finally {
      setSaving(false);
    }
  };

  const createAssessment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          description: form.get("description"),
          assessmentType: form.get("assessmentType"),
          subject: form.get("subject"),
          className: form.get("className"),
          durationMinutes: Number(form.get("durationMinutes")),
          passMark: Number(form.get("passMark")),
          questions,
        }),
      });
      if (!response.ok) throw new Error(await readError(response));
      setQuestions([newQuestion(), newQuestion()]);
      setAssessmentOpen(false);
      showMessage("success", "Assessment published. Students can take it and receive their scores instantly.");
      await loadContent();
    } catch (error) {
      showMessage("error", error instanceof Error ? error.message : "The assessment could not be published.");
    } finally {
      setSaving(false);
    }
  };

  const updateQuestion = (questionIndex: number, update: Partial<QuestionDraft>) => {
    setQuestions((current) => current.map((question, index) => index === questionIndex ? { ...question, ...update } : question));
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions((current) => current.map((question, index) => {
      if (index !== questionIndex) return question;
      return { ...question, options: question.options.map((option, currentOptionIndex) => currentOptionIndex === optionIndex ? value : option) };
    }));
  };

  return (
    <section className="learning-studio panel" id="learning-studio" aria-labelledby="learning-studio-title">
      <div className="learning-studio-header">
        <div>
          <span className="feature-kicker"><Sparkles size={13} /> New learning tools</span>
          <h2 id="learning-studio-title">Learning studio</h2>
          <p>Publish lesson notes and create automatically graded assessments.</p>
        </div>
        <a className="student-preview-link" href="/student">Open student view <ExternalLink size={14} /></a>
      </div>

      {message && <div className={`studio-message ${message.tone}`} role="status"><CheckCircle2 size={16} />{message.text}</div>}

      <div className="learning-features">
        <section className="learning-feature" id="lesson-notes" aria-labelledby="lesson-note-title">
          <div className="learning-feature-top">
            <span className="feature-icon"><BookOpen size={21} /></span>
            <div><h3 id="lesson-note-title">Lesson notes</h3><p>PDF resources for your students</p></div>
            <button className="primary-studio-button" type="button" onClick={() => setUploadOpen(true)}><Upload size={15} />Upload PDF</button>
          </div>
          <div className="studio-list">
            {loading ? <div className="studio-loading"><LoaderCircle className="spin" size={18} />Loading notes…</div> : notes.length ? notes.slice(0, 3).map((note) => (
              <article className="studio-row" key={note.id}>
                <span className="row-file-icon"><FileText size={17} /></span>
                <div><strong>{note.title}</strong><span>{note.subject} · {note.className} · {formatFileSize(note.fileSize)}</span></div>
                <a href={`/api/lesson-notes/${note.id}/file`} target="_blank" rel="noreferrer" aria-label={`Open ${note.title}`}><ChevronRight size={16} /></a>
              </article>
            )) : <div className="studio-empty"><BookOpen size={20} /><span><strong>No lesson notes yet</strong>Upload your first PDF for students.</span></div>}
          </div>
        </section>

        <section className="learning-feature" id="assessments" aria-labelledby="assessments-title">
          <div className="learning-feature-top">
            <span className="feature-icon amber"><GraduationCap size={22} /></span>
            <div><h3 id="assessments-title">Quizzes & exams</h3><p>Instant marking and scores</p></div>
            <button className="primary-studio-button amber" type="button" onClick={() => setAssessmentOpen(true)}><Plus size={15} />Create</button>
          </div>
          <div className="studio-list">
            {loading ? <div className="studio-loading"><LoaderCircle className="spin" size={18} />Loading assessments…</div> : assessments.length ? assessments.slice(0, 3).map((assessment) => (
              <article className="studio-row" key={assessment.id}>
                <span className="row-file-icon amber"><GraduationCap size={17} /></span>
                <div><strong>{assessment.title}</strong><span>{assessment.className} · {assessment.questionCount} questions · {assessment.durationMinutes} min</span></div>
                <span className={`assessment-type ${assessment.assessmentType}`}>{assessment.assessmentType}</span>
              </article>
            )) : <div className="studio-empty"><GraduationCap size={21} /><span><strong>No assessments yet</strong>Create a quiz students can take today.</span></div>}
          </div>
        </section>
      </div>

      {uploadOpen && (
        <div className="dialog-backdrop studio-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target && !saving) setUploadOpen(false); }}>
          <section className="studio-dialog" role="dialog" aria-modal="true" aria-labelledby="upload-title">
            <button className="dialog-close" type="button" aria-label="Close" disabled={saving} onClick={() => setUploadOpen(false)}><X size={18} /></button>
            <span className="dialog-icon"><Upload size={23} /></span>
            <p className="eyebrow">Lesson library</p>
            <h2 id="upload-title">Upload a lesson note</h2>
            <p className="dialog-description">Publish a PDF students can download or open for printing.</p>
            <form className="studio-form" onSubmit={uploadLessonNote}>
              <label><span>Lesson title</span><input name="title" required maxLength={120} placeholder="e.g. Photosynthesis — Week 10" /></label>
              <div className="form-grid two"><label><span>Subject</span><input name="subject" required maxLength={80} placeholder="Biology" /></label><label><span>Class</span><input name="className" required maxLength={40} placeholder="SS 1B" /></label></div>
              <label><span>Short description <em>optional</em></span><textarea name="description" rows={3} maxLength={300} placeholder="What students will learn from this note" /></label>
              <label className="file-drop"><Upload size={22} /><span><strong>Choose lesson note PDF</strong><small>PDF only · Maximum 8 MB</small></span><input name="file" type="file" accept="application/pdf,.pdf" required /></label>
              <div className="dialog-actions"><button type="button" disabled={saving} onClick={() => setUploadOpen(false)}>Cancel</button><button className="solid-action" type="submit" disabled={saving}>{saving ? <><LoaderCircle className="spin" size={15} />Publishing…</> : <><Upload size={15} />Publish note</>}</button></div>
            </form>
          </section>
        </div>
      )}

      {assessmentOpen && (
        <div className="dialog-backdrop studio-dialog-backdrop" role="presentation">
          <section className="studio-dialog assessment-dialog" role="dialog" aria-modal="true" aria-labelledby="create-assessment-title">
            <div className="assessment-dialog-head"><div><p className="eyebrow">Assessment builder</p><h2 id="create-assessment-title">Create a quiz or exam</h2><p className="dialog-description">Multiple-choice questions are marked instantly after submission.</p></div><button className="dialog-close static" type="button" aria-label="Close" disabled={saving} onClick={() => setAssessmentOpen(false)}><X size={18} /></button></div>
            <form className="studio-form" onSubmit={createAssessment}>
              <div className="assessment-meta-card">
                <div className="form-grid two"><label><span>Assessment title</span><input name="title" required maxLength={120} placeholder="Biology Week 10 Quiz" /></label><label><span>Type</span><select name="assessmentType"><option value="quiz">Quiz</option><option value="exam">Exam</option></select></label></div>
                <div className="form-grid four"><label><span>Subject</span><input name="subject" required placeholder="Biology" /></label><label><span>Class</span><input name="className" required placeholder="SS 1B" /></label><label><span>Duration</span><div className="input-suffix"><input name="durationMinutes" type="number" min="1" max="180" defaultValue="15" required /><span>min</span></div></label><label><span>Pass mark</span><div className="input-suffix"><input name="passMark" type="number" min="0" max="100" defaultValue="50" required /><span>%</span></div></label></div>
                <label><span>Instructions <em>optional</em></span><textarea name="description" rows={2} maxLength={400} placeholder="Read each question carefully and choose the best answer." /></label>
              </div>

              <div className="question-builder-head"><div><strong>Questions</strong><span>{questions.length} total</span></div><button type="button" onClick={() => setQuestions((current) => [...current, newQuestion()])}><Plus size={14} />Add question</button></div>
              <div className="question-builder">
                {questions.map((question, questionIndex) => (
                  <fieldset className="question-card" key={questionIndex}>
                    <div className="question-number"><span>{questionIndex + 1}</span><strong>Multiple choice</strong>{questions.length > 1 && <button type="button" aria-label={`Remove question ${questionIndex + 1}`} onClick={() => setQuestions((current) => current.filter((_, index) => index !== questionIndex))}><Trash2 size={15} /></button>}</div>
                    <label><span>Question</span><textarea required rows={2} value={question.prompt} onChange={(event) => updateQuestion(questionIndex, { prompt: event.target.value })} placeholder="Write your question here" /></label>
                    <div className="answer-options">
                      <span className="answer-options-label">Answers <em>Select the correct one</em></span>
                      {question.options.map((option, optionIndex) => (
                        <label className={`answer-option${question.correctOption === optionIndex ? " correct" : ""}`} key={optionIndex}>
                          <input type="radio" name={`correct-${questionIndex}`} checked={question.correctOption === optionIndex} onChange={() => updateQuestion(questionIndex, { correctOption: optionIndex })} />
                          <span>{String.fromCharCode(65 + optionIndex)}</span>
                          <input required value={option} onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)} placeholder={`Answer option ${optionIndex + 1}`} />
                          {question.correctOption === optionIndex && <CheckCircle2 size={16} />}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>
              <div className="assessment-submit-bar"><span><Clock3 size={15} />Students see their score immediately after submitting.</span><div className="dialog-actions"><button type="button" disabled={saving} onClick={() => setAssessmentOpen(false)}>Save for later</button><button className="solid-action amber" type="submit" disabled={saving}>{saving ? <><LoaderCircle className="spin" size={15} />Publishing…</> : <><GraduationCap size={16} />Publish assessment</>}</button></div></div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
