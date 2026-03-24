import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  BookOpenCheck,
  Download,
  Key,
  Printer,
} from "lucide-react";
import React, { useRef } from "react";
import type { Question } from "../backend.d";
import { usePaper } from "../context/PaperContext";
import { useGetSettings } from "../hooks/useQueries";

const optionLabels = ["A", "B", "C", "D"] as const;

function QuestionBlock({ q, index }: { q: Question; index: number }) {
  return (
    <div className="mb-5 page-break-inside-avoid">
      <p className="font-medium text-sm mb-2">
        <span className="font-bold">Q{index}.</span> {q.text}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pl-4">
        {optionLabels.map((opt) => (
          <p key={opt} className="text-sm">
            <span className="font-medium">{opt})</span>{" "}
            {(q as unknown as Record<string, string>)[`option${opt}`]}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function PDFPreviewPage() {
  const navigate = useNavigate();
  const { generatedPaper } = usePaper();
  const { data: settings } = useGetSettings();
  const printRef = useRef<HTMLDivElement>(null);

  if (!generatedPaper) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center"
        data-ocid="pdf_preview.error_state"
      >
        <AlertCircle size={48} className="text-muted-foreground opacity-50" />
        <div>
          <p className="text-lg font-semibold">No Paper Generated</p>
          <p className="text-muted-foreground text-sm mt-1">
            Please generate a paper first from the Paper Generator page.
          </p>
        </div>
        <Button
          onClick={() => navigate({ to: "/generate-paper" })}
          variant="outline"
          className="gap-2"
        >
          <ArrowLeft size={16} /> Go to Paper Generator
        </Button>
      </div>
    );
  }

  const parts = ["A", "B", "C"];
  const questionsByPart = (part: string) =>
    generatedPaper.questions.filter((q) => q.part === part);
  const allQuestions = generatedPaper.questions;

  const handlePrint = () => window.print();

  const handleDownloadAnswerKey = () => {
    const lines = allQuestions.map((q, i) => `Q${i + 1}. ${q.correctAnswer}`);
    const blob = new Blob([`Answer Key\n\n${lines.join("\n")}`], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "answer-key.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSolutions = () => {
    const lines = allQuestions
      .map(
        (q, i) =>
          `Q${i + 1}. Correct: ${q.correctAnswer}\n${q.explanation ? `Explanation: ${q.explanation}` : ""}`,
      )
      .join("\n\n");
    const blob = new Blob([`Solutions\n\n${lines}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "solutions.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const today = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const totalMarks = allQuestions.length * 2;

  return (
    <div className="space-y-4" data-ocid="pdf_preview.section">
      {/* Action Bar */}
      <div
        className="flex flex-wrap gap-3 no-print"
        data-ocid="pdf_preview.actions.panel"
      >
        <Button
          onClick={() => navigate({ to: "/generate-paper" })}
          variant="outline"
          className="gap-2"
          data-ocid="pdf_preview.back.button"
        >
          <ArrowLeft size={16} /> Back
        </Button>
        <Button
          onClick={handlePrint}
          className="gap-2 bg-[oklch(0.17_0.04_255)] hover:bg-[oklch(0.24_0.06_255)] text-white"
          data-ocid="pdf_preview.print.button"
        >
          <Printer size={16} /> Print / Save PDF
        </Button>
        <Button
          onClick={handleDownloadAnswerKey}
          variant="outline"
          className="gap-2"
          data-ocid="pdf_preview.answer_key.button"
        >
          <Key size={16} /> Answer Key
        </Button>
        <Button
          onClick={handleDownloadSolutions}
          variant="outline"
          className="gap-2"
          data-ocid="pdf_preview.solutions.button"
        >
          <BookOpenCheck size={16} /> Solutions
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline">
            Total: {allQuestions.length} Questions
          </Badge>
          <Badge variant="outline">{totalMarks} Marks</Badge>
        </div>
      </div>

      {/* Paper Preview */}
      <div
        ref={printRef}
        className="paper-preview bg-white border border-border rounded-xl shadow-sm p-8 print:shadow-none print:border-none print:rounded-none relative overflow-hidden"
      >
        {/* Watermark */}
        {settings?.watermarkText && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            style={{
              transform: "rotate(-30deg)",
              fontSize: "4rem",
              color: "rgba(0,0,0,0.04)",
              fontWeight: 900,
              whiteSpace: "nowrap",
              zIndex: 0,
            }}
          >
            {settings.watermarkText}
          </div>
        )}

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-6 pb-5 border-b-2 border-[oklch(0.17_0.04_255)]">
            <h1 className="text-xl font-bold text-[oklch(0.17_0.04_255)]">
              {settings?.instituteName || "Institute Name"}
            </h1>
            <h2 className="text-lg font-semibold mt-1">
              CSIR NET Life Sciences Mock Test
            </h2>
            <div className="flex justify-center gap-6 mt-3 text-sm text-muted-foreground">
              <span>Date: {today}</span>
              <span>Time: 3 Hours</span>
              <span>Max Marks: {totalMarks}</span>
            </div>
            {settings?.negativeMarkingEnabled && (
              <p className="text-xs text-red-600 mt-2">
                Negative Marking: -{settings.negativeMarkingValue} marks per
                wrong answer
              </p>
            )}
          </div>

          {/* Instructions */}
          <div className="mb-6 text-xs text-muted-foreground space-y-1 border border-dashed border-border p-4 rounded-lg">
            <p className="font-semibold text-foreground">
              General Instructions:
            </p>
            <p>1. All questions are compulsory.</p>
            <p>
              2. Each question has four options. Select the most appropriate
              answer.
            </p>
            <p>3. Use blue/black ball pen to fill the OMR sheet.</p>
            {settings?.negativeMarkingEnabled && (
              <p>4. There will be negative marking for wrong answers.</p>
            )}
          </div>

          {/* Parts */}
          {parts.map((part) => {
            const qs = questionsByPart(part);
            if (qs.length === 0) return null;

            const partLabels: Record<string, string> = {
              A: "PART A — General Aptitude",
              B: "PART B — Life Sciences (Core)",
              C: "PART C — Analytical",
            };

            const partQStart = parts
              .slice(0, parts.indexOf(part))
              .reduce((acc, p) => acc + questionsByPart(p).length, 1);

            return (
              <div key={part} className="mb-8">
                <div className="bg-[oklch(0.17_0.04_255)] text-white px-4 py-2 rounded-lg mb-4">
                  <h3 className="font-bold text-sm">{partLabels[part]}</h3>
                  <p className="text-xs opacity-80">Questions: {qs.length}</p>
                </div>
                {qs.map((q, i) => (
                  <QuestionBlock key={q.id} q={q} index={partQStart + i} />
                ))}
              </div>
            );
          })}

          {/* If no part info — show all */}
          {parts.every((p) => questionsByPart(p).length === 0) &&
            allQuestions.length > 0 && (
              <div>
                {allQuestions.map((q, i) => (
                  <QuestionBlock key={q.id} q={q} index={i + 1} />
                ))}
              </div>
            )}

          {/* Footer */}
          <Separator className="mt-8 mb-4" />
          <p className="text-xs text-center text-muted-foreground">
            {settings?.footerText ||
              "CSIR NET Life Sciences Mock Test — Good Luck!"}
          </p>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .paper-preview { padding: 15mm; box-shadow: none; border: none; }
        }
      `}</style>
    </div>
  );
}
