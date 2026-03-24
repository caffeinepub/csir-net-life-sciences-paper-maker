import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Loader2, RotateCcw, Save } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Question } from "../backend.d";
import { useSyllabus } from "../context/SyllabusContext";
import { useActor } from "../hooks/useActor";
import {
  useCreateQuestion,
  useGetAllQuestions,
  useUpdateQuestion,
} from "../hooks/useQueries";

const EMPTY_FORM = {
  text: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "",
  explanation: "",
  unitId: "",
  topicId: "",
  subtopicId: "",
  part: "",
  difficulty: "",
};

export default function AddQuestionPage() {
  const { actor } = useActor();
  const { syllabus, getTopicsForUnit, getSubtopicsForTopic } = useSyllabus();
  const createQ = useCreateQuestion();
  const updateQ = useUpdateQuestion();

  // Check for edit mode via URL search params
  const search = useSearch({ strict: false }) as { editId?: string };
  const editId = search?.editId;

  const [form, setForm] = useState(EMPTY_FORM);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!editId || !actor) return;
    actor
      .getQuestion(editId)
      .then((q) => {
        setForm({
          text: q.text,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation ?? "",
          unitId: q.unitId,
          topicId: q.topicId,
          subtopicId: q.subtopicId,
          part: q.part,
          difficulty: q.difficulty,
        });
        setIsEditing(true);
      })
      .catch(() => toast.error("Failed to load question"));
  }, [editId, actor]);

  const set = (field: string, value: string) => {
    setForm((prev) => {
      const update: typeof prev = { ...prev, [field]: value };
      if (field === "unitId") {
        update.topicId = "";
        update.subtopicId = "";
      }
      if (field === "topicId") {
        update.subtopicId = "";
      }
      return update;
    });
  };

  const topics = getTopicsForUnit(form.unitId);
  const subtopics = getSubtopicsForTopic(form.unitId, form.topicId);

  const validate = () => {
    const required = [
      "text",
      "optionA",
      "optionB",
      "optionC",
      "optionD",
      "correctAnswer",
      "unitId",
      "topicId",
      "part",
      "difficulty",
    ];
    return required.every((k) => (form as Record<string, string>)[k]?.trim());
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Please fill all required fields");
      return;
    }
    const question: Question = {
      id: editId ?? "",
      text: form.text,
      optionA: form.optionA,
      optionB: form.optionB,
      optionC: form.optionC,
      optionD: form.optionD,
      correctAnswer: form.correctAnswer,
      explanation: form.explanation || undefined,
      unitId: form.unitId,
      topicId: form.topicId,
      subtopicId: form.subtopicId,
      part: form.part,
      difficulty: form.difficulty,
      createdAt: BigInt(0),
    };
    try {
      if (isEditing) {
        await updateQ.mutateAsync(question);
        toast.success("Question updated successfully");
      } else {
        await createQ.mutateAsync(question);
        toast.success("Question saved successfully");
        setForm(EMPTY_FORM);
      }
    } catch {
      toast.error("Failed to save question");
    }
  };

  const isPending = createQ.isPending || updateQ.isPending;

  return (
    <div
      className="max-w-3xl mx-auto space-y-6"
      data-ocid="add_question.section"
    >
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit Question" : "Add New Question"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Question Text */}
          <div className="space-y-1.5">
            <Label htmlFor="q-text">
              Question Text <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="q-text"
              rows={3}
              placeholder="Enter the question here..."
              value={form.text}
              onChange={(e) => set("text", e.target.value)}
              data-ocid="add_question.text.textarea"
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(["A", "B", "C", "D"] as const).map((opt) => (
              <div key={opt} className="space-y-1.5">
                <Label htmlFor={`opt-${opt}`}>
                  Option {opt} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`opt-${opt}`}
                  placeholder={`Option ${opt}`}
                  value={(form as Record<string, string>)[`option${opt}`]}
                  onChange={(e) => set(`option${opt}`, e.target.value)}
                  data-ocid={`add_question.option_${opt.toLowerCase()}.input`}
                />
              </div>
            ))}
          </div>

          {/* Correct Answer + Explanation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>
                Correct Answer <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.correctAnswer}
                onValueChange={(v) => set("correctAnswer", v)}
              >
                <SelectTrigger data-ocid="add_question.correct_answer.select">
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
                <SelectContent>
                  {["A", "B", "C", "D"].map((o) => (
                    <SelectItem key={o} value={o}>
                      Option {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="explanation">Explanation (optional)</Label>
              <Input
                id="explanation"
                placeholder="Brief explanation..."
                value={form.explanation}
                onChange={(e) => set("explanation", e.target.value)}
                data-ocid="add_question.explanation.input"
              />
            </div>
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>
                Unit <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.unitId}
                onValueChange={(v) => set("unitId", v)}
              >
                <SelectTrigger data-ocid="add_question.unit.select">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {syllabus.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>
                Topic <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.topicId}
                onValueChange={(v) => set("topicId", v)}
                disabled={!form.unitId}
              >
                <SelectTrigger data-ocid="add_question.topic.select">
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Subtopic</Label>
              <Select
                value={form.subtopicId}
                onValueChange={(v) => set("subtopicId", v)}
                disabled={!form.topicId}
              >
                <SelectTrigger data-ocid="add_question.subtopic.select">
                  <SelectValue placeholder="Select subtopic" />
                </SelectTrigger>
                <SelectContent>
                  {subtopics.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>
                Part <span className="text-red-500">*</span>
              </Label>
              <Select value={form.part} onValueChange={(v) => set("part", v)}>
                <SelectTrigger data-ocid="add_question.part.select">
                  <SelectValue placeholder="Select part" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Part A – General Aptitude</SelectItem>
                  <SelectItem value="B">Part B – Life Sciences</SelectItem>
                  <SelectItem value="C">Part C – Analytical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>
                Difficulty <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.difficulty}
                onValueChange={(v) => set("difficulty", v)}
              >
                <SelectTrigger data-ocid="add_question.difficulty.select">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-[oklch(0.17_0.04_255)] hover:bg-[oklch(0.24_0.06_255)] text-white gap-2"
              data-ocid="add_question.save.submit_button"
            >
              {isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isPending
                ? "Saving..."
                : isEditing
                  ? "Update Question"
                  : "Save Question"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setForm(EMPTY_FORM);
                setIsEditing(false);
              }}
              className="gap-2"
              data-ocid="add_question.clear.button"
            >
              <RotateCcw size={16} /> Clear Form
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
