"use client";

import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, LoaderCircle, Upload, X } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import type { QuestionDraft } from "./LearningStudio";

type Cell = string | number | boolean | Date | null | undefined;
type ParsedImport = { questions: QuestionDraft[]; errors: string[]; totalRows: number };

const HEADER_ALIASES = {
  question: ["question", "question text"],
  optionA: ["option a", "answer a", "a"],
  optionB: ["option b", "answer b", "b"],
  optionC: ["option c", "answer c", "c"],
  optionD: ["option d", "answer d", "d"],
  correct: ["correct answer", "correct option", "answer", "correct"],
  marks: ["marks", "points", "score"],
} as const;

function cellText(value: Cell) {
  if (value instanceof Date) return value.toISOString();
  return value == null ? "" : String(value).trim();
}

function normalizeHeader(value: Cell) {
  return cellText(value).toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function findColumn(headers: string[], aliases: readonly string[]) {
  return headers.findIndex((header) => aliases.includes(header));
}

function parseQuestionRows(inputRows: Cell[][]): ParsedImport {
  const rows = inputRows.filter((row) => row.some((cell) => cellText(cell)));
  if (!rows.length) return { questions: [], errors: ["The file is empty."], totalRows: 0 };

  const headers = rows[0].map(normalizeHeader);
  const columns = {
    question: findColumn(headers, HEADER_ALIASES.question),
    optionA: findColumn(headers, HEADER_ALIASES.optionA),
    optionB: findColumn(headers, HEADER_ALIASES.optionB),
    optionC: findColumn(headers, HEADER_ALIASES.optionC),
    optionD: findColumn(headers, HEADER_ALIASES.optionD),
    correct: findColumn(headers, HEADER_ALIASES.correct),
    marks: findColumn(headers, HEADER_ALIASES.marks),
  };

  const missing = [
    ["Question", columns.question],
    ["Option A", columns.optionA],
    ["Option B", columns.optionB],
    ["Correct Answer", columns.correct],
  ].filter(([, index]) => index === -1).map(([label]) => label);

  if (missing.length) {
    return { questions: [], errors: [`Missing required column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.`], totalRows: Math.max(0, rows.length - 1) };
  }

  const questions: QuestionDraft[] = [];
  const errors: string[] = [];
  const dataRows = rows.slice(1);

  if (dataRows.length > 50) errors.push("Only the first 50 questions can be imported at once.");

  dataRows.slice(0, 50).forEach((row, index) => {
    const spreadsheetRow = index + 2;
    const prompt = cellText(row[columns.question]);
    const rawOptions = [
      cellText(row[columns.optionA]),
      cellText(row[columns.optionB]),
      columns.optionC >= 0 ? cellText(row[columns.optionC]) : "",
      columns.optionD >= 0 ? cellText(row[columns.optionD]) : "",
    ];
    const lastOptionIndex = rawOptions.reduce((last, option, optionIndex) => option ? optionIndex : last, -1);
    const options = rawOptions.slice(0, lastOptionIndex + 1);
    const correctAnswer = cellText(row[columns.correct]);
    const marksText = columns.marks >= 0 ? cellText(row[columns.marks]) : "1";
    const points = marksText ? Number(marksText) : 1;
    const rowErrors: string[] = [];

    if (!prompt) rowErrors.push("question text is missing");
    if (options.length < 2 || !options[0] || !options[1]) rowErrors.push("Option A and Option B are required");
    if (options.some((option) => !option)) rowErrors.push("answer options cannot have gaps");
    if (!correctAnswer) rowErrors.push("correct answer is missing");
    if (!Number.isInteger(points) || points < 1 || points > 20) rowErrors.push("marks must be a whole number from 1 to 20");

    let correctOption = -1;
    if (/^[A-D]$/i.test(correctAnswer)) {
      correctOption = correctAnswer.toUpperCase().charCodeAt(0) - 65;
    } else if (correctAnswer) {
      correctOption = options.findIndex((option) => option.toLowerCase() === correctAnswer.toLowerCase());
    }
    if (correctAnswer && (correctOption < 0 || correctOption >= options.length)) {
      rowErrors.push("correct answer must be A–D or match an option exactly");
    }

    if (rowErrors.length) {
      errors.push(`Row ${spreadsheetRow}: ${rowErrors.join("; ")}.`);
      return;
    }

    questions.push({ prompt, options, correctOption, points });
  });

  return { questions, errors, totalRows: dataRows.length };
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];
    if (character === '"') {
      if (quoted && next === '"') { value += '"'; index += 1; }
      else quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(value); value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(value); rows.push(row); row = []; value = "";
    } else {
      value += character;
    }
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  return rows;
}

export function ExamQuestionImporter({ onImport }: { onImport: (questions: QuestionDraft[]) => void }) {
  const [open, setOpen] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ParsedImport | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setParsed(null);
    setFileName("");
    setParsing(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const close = () => { reset(); setOpen(false); };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setParsing(true);
    setFileName(file.name);
    setParsed(null);

    if (file.size > 3 * 1024 * 1024) {
      setParsed({ questions: [], errors: ["The import file must be smaller than 3 MB."], totalRows: 0 });
      setParsing(false);
      return;
    }

    try {
      let rows: Cell[][];
      if (file.name.toLowerCase().endsWith(".csv")) {
        rows = parseCsv(await file.text());
      } else if (file.name.toLowerCase().endsWith(".xlsx")) {
        const { default: readXlsxFile } = await import("read-excel-file/browser");
        rows = await readXlsxFile(file);
      } else {
        throw new Error("Choose a CSV or Excel (.xlsx) file.");
      }
      setParsed(parseQuestionRows(rows));
    } catch (error) {
      setParsed({ questions: [], errors: [error instanceof Error ? error.message : "The file could not be read."], totalRows: 0 });
    } finally {
      setParsing(false);
    }
  };

  const importQuestions = () => {
    if (!parsed?.questions.length || parsed.errors.length) return;
    onImport(parsed.questions);
    close();
  };

  return (
    <>
      <div className="bulk-import-strip">
        <span className="bulk-import-icon"><FileSpreadsheet size={19} /></span>
        <span><strong>Already have your exam questions?</strong><small>Import questions, answer options, correct answers and marks from CSV or Excel.</small></span>
        <a href="/exam-question-template.csv" download><Download size={14} />Template</a>
        <button type="button" onClick={() => setOpen(true)}><Upload size={14} />Import file</button>
      </div>

      {open && (
        <div className="dialog-backdrop import-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target && !parsing) close(); }}>
          <section className="studio-dialog import-dialog" role="dialog" aria-modal="true" aria-labelledby="import-questions-title">
            <button className="dialog-close" type="button" aria-label="Close import" disabled={parsing} onClick={close}><X size={18} /></button>
            <span className="dialog-icon amber"><FileSpreadsheet size={23} /></span>
            <p className="eyebrow">Bulk question import</p>
            <h2 id="import-questions-title">Upload questions and answers</h2>
            <p className="dialog-description">Use the template so every question, option, correct answer and mark is imported accurately.</p>

            <div className="import-steps">
              <div><span>1</span><p><strong>Download the template</strong><small>Open it in Excel or Google Sheets.</small></p><a href="/exam-question-template.csv" download><Download size={14} />Download</a></div>
              <div><span>2</span><p><strong>Add your questions</strong><small>Use A–D in the Correct Answer column.</small></p></div>
              <div><span>3</span><p><strong>Upload and review</strong><small>CSV and Excel (.xlsx), up to 50 questions.</small></p></div>
            </div>

            <label className={`question-file-drop${fileName ? " has-file" : ""}`}>
              {parsing ? <LoaderCircle className="spin" size={24} /> : <Upload size={24} />}
              <span><strong>{fileName || "Choose question file"}</strong><small>{parsing ? "Checking questions…" : "CSV or Excel (.xlsx) · Maximum 3 MB"}</small></span>
              <input ref={inputRef} type="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => void handleFile(event)} />
            </label>

            {parsed && (
              <div className={`import-result${parsed.errors.length ? " has-errors" : " valid"}`}>
                <div className="import-result-summary">
                  {parsed.errors.length ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                  <span><strong>{parsed.errors.length ? "Please fix the highlighted rows" : `${parsed.questions.length} questions ready to import`}</strong><small>{parsed.errors.length ? `${parsed.errors.length} issue${parsed.errors.length > 1 ? "s" : ""} found in ${parsed.totalRows} rows.` : "All required columns and answers passed validation."}</small></span>
                </div>
                {parsed.errors.length ? <ul className="import-errors">{parsed.errors.slice(0, 8).map((error) => <li key={error}>{error}</li>)}{parsed.errors.length > 8 && <li>And {parsed.errors.length - 8} more issues.</li>}</ul> : (
                  <div className="import-preview">
                    {parsed.questions.slice(0, 3).map((question, index) => <div key={`${question.prompt}-${index}`}><span>{index + 1}</span><p><strong>{question.prompt}</strong><small>{question.options.length} options · Answer {String.fromCharCode(65 + question.correctOption)} · {question.points} {question.points === 1 ? "mark" : "marks"}</small></p></div>)}
                    {parsed.questions.length > 3 && <p className="more-imported">+ {parsed.questions.length - 3} more questions</p>}
                  </div>
                )}
              </div>
            )}

            <div className="dialog-actions import-actions"><button type="button" disabled={parsing} onClick={close}>Cancel</button><button className="solid-action amber" type="button" disabled={!parsed?.questions.length || Boolean(parsed.errors.length) || parsing} onClick={importQuestions}><Upload size={15} />Import {parsed?.questions.length || ""} questions</button></div>
          </section>
        </div>
      )}
    </>
  );
}
