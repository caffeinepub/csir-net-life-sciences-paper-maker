import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import type { Question } from "../backend.d";
import { useSyllabus } from "../context/SyllabusContext";
import { useDeleteQuestion, useGetAllQuestions } from "../hooks/useQueries";

const PAGE_SIZE = 20;

const diffColors: Record<string, string> = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-red-100 text-red-700",
};
const partColors: Record<string, string> = {
  A: "bg-blue-100 text-blue-700",
  B: "bg-purple-100 text-purple-700",
  C: "bg-green-100 text-green-700",
};

export default function QuestionBankPage() {
  const navigate = useNavigate();
  const { syllabus, getTopicsForUnit, getSubtopicsForTopic } = useSyllabus();
  const { data: allQuestions, isLoading } = useGetAllQuestions("");
  const deleteQ = useDeleteQuestion();

  const [search, setSearch] = useState("");
  const [filterUnit, setFilterUnit] = useState("all");
  const [filterTopic, setFilterTopic] = useState("all");
  const [filterSubtopic, setFilterSubtopic] = useState("all");
  const [filterPart, setFilterPart] = useState("all");
  const [filterDiff, setFilterDiff] = useState("all");
  const [page, setPage] = useState(1);
  const [viewQ, setViewQ] = useState<Question | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const topics = getTopicsForUnit(filterUnit === "all" ? "" : filterUnit);
  const _subtopics = getSubtopicsForTopic(
    filterUnit === "all" ? "" : filterUnit,
    filterTopic === "all" ? "" : filterTopic,
  );

  const filtered = useMemo(() => {
    return (allQuestions ?? []).filter((q) => {
      if (search && !q.text.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (filterUnit !== "all" && q.unitId !== filterUnit) return false;
      if (filterTopic !== "all" && q.topicId !== filterTopic) return false;
      if (filterSubtopic !== "all" && q.subtopicId !== filterSubtopic)
        return false;
      if (filterPart !== "all" && q.part !== filterPart) return false;
      if (filterDiff !== "all" && q.difficulty !== filterDiff) return false;
      return true;
    });
  }, [
    allQuestions,
    search,
    filterUnit,
    filterTopic,
    filterSubtopic,
    filterPart,
    filterDiff,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteQ.mutateAsync(deleteId);
      toast.success("Question deleted");
    } catch {
      toast.error("Failed to delete question");
    }
    setDeleteId(null);
  };

  const getUnitName = (id: string) =>
    syllabus.find((u) => u.id === id)?.name ?? id;

  return (
    <div className="space-y-4" data-ocid="question_bank.section">
      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search questions..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
                data-ocid="question_bank.search_input"
              />
            </div>
            <Select
              value={filterUnit}
              onValueChange={(v) => {
                setFilterUnit(v);
                setFilterTopic("all");
                setFilterSubtopic("all");
                setPage(1);
              }}
            >
              <SelectTrigger
                className="w-48"
                data-ocid="question_bank.unit.select"
              >
                <SelectValue placeholder="All Units" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                {syllabus.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name.slice(0, 30)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterTopic}
              onValueChange={(v) => {
                setFilterTopic(v);
                setFilterSubtopic("all");
                setPage(1);
              }}
              disabled={filterUnit === "all"}
            >
              <SelectTrigger
                className="w-40"
                data-ocid="question_bank.topic.select"
              >
                <SelectValue placeholder="All Topics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {topics.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name.slice(0, 30)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterPart}
              onValueChange={(v) => {
                setFilterPart(v);
                setPage(1);
              }}
            >
              <SelectTrigger
                className="w-32"
                data-ocid="question_bank.part.select"
              >
                <SelectValue placeholder="All Parts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Parts</SelectItem>
                <SelectItem value="A">Part A</SelectItem>
                <SelectItem value="B">Part B</SelectItem>
                <SelectItem value="C">Part C</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterDiff}
              onValueChange={(v) => {
                setFilterDiff(v);
                setPage(1);
              }}
            >
              <SelectTrigger
                className="w-36"
                data-ocid="question_bank.difficulty.select"
              >
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Questions{" "}
            <span className="text-muted-foreground font-normal text-sm">
              ({filtered.length} found)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="question_bank.questions.empty_state"
            >
              <Search size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No questions match your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="question_bank.table">
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead className="w-48">Unit</TableHead>
                    <TableHead className="w-20">Part</TableHead>
                    <TableHead className="w-24">Difficulty</TableHead>
                    <TableHead className="w-28 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((q, i) => (
                    <TableRow
                      key={q.id}
                      data-ocid={`question_bank.questions.item.${i + 1}`}
                    >
                      <TableCell className="text-muted-foreground text-xs">
                        {(page - 1) * PAGE_SIZE + i + 1}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm truncate max-w-xs">{q.text}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {getUnitName(q.unitId)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs ${partColors[q.part] ?? ""}`}
                        >
                          Part {q.part}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs ${diffColors[q.difficulty] ?? ""}`}
                        >
                          {q.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewQ(q)}
                            data-ocid={`question_bank.view.button.${i + 1}`}
                          >
                            <Eye size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate({
                                to: "/add-question",
                                search: { editId: q.id },
                              })
                            }
                            data-ocid={`question_bank.edit_button.${i + 1}`}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => setDeleteId(q.id)}
                            data-ocid={`question_bank.delete_button.${i + 1}`}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  data-ocid="question_bank.pagination_prev"
                >
                  <ChevronLeft size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  data-ocid="question_bank.pagination_next"
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={!!viewQ} onOpenChange={(o) => !o && setViewQ(null)}>
        <DialogContent
          className="max-w-2xl"
          data-ocid="question_bank.view.dialog"
        >
          <DialogHeader>
            <DialogTitle>Question Details</DialogTitle>
            <DialogDescription>
              Full question with options and answer
            </DialogDescription>
          </DialogHeader>
          {viewQ && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-medium">{viewQ.text}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(["A", "B", "C", "D"] as const).map((opt) => {
                  const val = (viewQ as unknown as Record<string, string>)[
                    `option${opt}`
                  ];
                  const isCorrect = viewQ.correctAnswer === opt;
                  return (
                    <div
                      key={opt}
                      className={`p-3 rounded-lg border text-sm ${
                        isCorrect
                          ? "border-green-400 bg-green-50 text-green-800 font-medium"
                          : "border-border"
                      }`}
                    >
                      <span className="font-medium">{opt})</span> {val}
                      {isCorrect && (
                        <span className="ml-2 text-xs text-green-600">
                          (Correct)
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {viewQ.explanation && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs font-medium text-blue-700 mb-1">
                    Explanation
                  </p>
                  <p className="text-sm text-blue-800">{viewQ.explanation}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Badge className={partColors[viewQ.part] ?? ""}>
                  Part {viewQ.part}
                </Badge>
                <Badge className={diffColors[viewQ.difficulty] ?? ""}>
                  {viewQ.difficulty}
                </Badge>
                <Badge variant="outline">{getUnitName(viewQ.unitId)}</Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="question_bank.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="question_bank.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              data-ocid="question_bank.delete.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
