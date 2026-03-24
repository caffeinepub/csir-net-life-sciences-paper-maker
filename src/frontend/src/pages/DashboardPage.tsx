import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Layers,
  PlusCircle,
} from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { useGetAllQuestions, useGetQuestionStats } from "../hooks/useQueries";

const partColors: Record<string, string> = {
  A: "bg-blue-100 text-blue-700",
  B: "bg-purple-100 text-purple-700",
  C: "bg-green-100 text-green-700",
};

const diffColors: Record<string, string> = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const navigate = useNavigate();

  const { data: questions, isLoading: questionsLoading } =
    useGetAllQuestions("");

  const totalQuestions = questions?.length ?? 0;

  const partCounts = ["A", "B", "C"].map((p) => ({
    part: p,
    count: questions?.filter((q) => q.part === p).length ?? 0,
  }));

  const diffCounts = ["Easy", "Medium", "Hard"].map((d) => ({
    diff: d,
    count: questions?.filter((q) => q.difficulty === d).length ?? 0,
  }));

  const recentQuestions = [...(questions ?? [])]
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-6" data-ocid="dashboard.section">
      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Total */}
        <Card className="border-0 shadow-sm" data-ocid="dashboard.total.card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Total Questions
                </p>
                {questionsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {totalQuestions}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 rounded-xl bg-[oklch(0.93_0.05_255)] flex items-center justify-center">
                <BookOpen size={20} className="text-[oklch(0.48_0.18_255)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Part counts */}
        {partCounts.map(({ part, count }) => (
          <Card key={part} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Part {part}
                  </p>
                  {questionsLoading ? (
                    <Skeleton className="h-8 w-12 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {count}
                    </p>
                  )}
                </div>
                <Badge className={`text-sm px-3 py-1 ${partColors[part]}`}>
                  Part {part}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Difficulty Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {diffCounts.map(({ diff, count }) => (
          <Card key={diff} className="border-0 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              {diff === "Easy" && (
                <CheckCircle2 size={24} className="text-emerald-500" />
              )}
              {diff === "Medium" && (
                <Clock size={24} className="text-amber-500" />
              )}
              {diff === "Hard" && (
                <AlertCircle size={24} className="text-red-500" />
              )}
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  {diff}
                </p>
                {questionsLoading ? (
                  <Skeleton className="h-6 w-10 mt-0.5" />
                ) : (
                  <p className="text-xl font-bold">{count}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            onClick={() => navigate({ to: "/add-question" })}
            className="bg-[oklch(0.17_0.04_255)] hover:bg-[oklch(0.24_0.06_255)] text-white gap-2"
            data-ocid="dashboard.add_question.button"
          >
            <PlusCircle size={16} /> Add Question
          </Button>
          <Button
            onClick={() => navigate({ to: "/question-bank" })}
            variant="outline"
            className="gap-2"
            data-ocid="dashboard.question_bank.button"
          >
            <BookOpen size={16} /> View Question Bank
          </Button>
          <Button
            onClick={() => navigate({ to: "/generate-paper" })}
            variant="outline"
            className="gap-2"
            data-ocid="dashboard.generate_paper.button"
          >
            <FileText size={16} /> Generate Paper
          </Button>
          <Button
            onClick={() => navigate({ to: "/settings" })}
            variant="outline"
            className="gap-2"
            data-ocid="dashboard.settings.button"
          >
            <BarChart3 size={16} /> Settings
          </Button>
        </CardContent>
      </Card>

      {/* Recent Questions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers size={16} /> Recent Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {questionsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : recentQuestions.length === 0 ? (
            <div
              className="text-center py-8 text-muted-foreground"
              data-ocid="dashboard.questions.empty_state"
            >
              <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">
                No questions yet. Start by adding questions to the bank.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentQuestions.map((q, i) => (
                <div
                  key={q.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors"
                  data-ocid={`dashboard.questions.item.${i + 1}`}
                >
                  <span className="text-xs font-mono text-muted-foreground w-5">
                    {i + 1}.
                  </span>
                  <p className="text-sm flex-1 truncate">{q.text}</p>
                  <Badge className={`text-xs ${partColors[q.part] ?? ""}`}>
                    Part {q.part}
                  </Badge>
                  <Badge
                    className={`text-xs ${diffColors[q.difficulty] ?? ""}`}
                  >
                    {q.difficulty}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
