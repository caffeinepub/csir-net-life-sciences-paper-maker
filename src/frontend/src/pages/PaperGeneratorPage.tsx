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
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Wand2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { usePaper } from "../context/PaperContext";
import { useSyllabus } from "../context/SyllabusContext";
import { useGeneratePaper } from "../hooks/useQueries";

type Scope = "full" | "unit" | "topic" | "subtopic";

export default function PaperGeneratorPage() {
  const navigate = useNavigate();
  const { syllabus, getTopicsForUnit, getSubtopicsForTopic } = useSyllabus();
  const generatePaper = useGeneratePaper();
  const { setGeneratedPaper } = usePaper();

  const [scope, setScope] = useState<Scope>("full");
  const [unitId, setUnitId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [subtopicId, setSubtopicId] = useState("");
  const [part, setPart] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [questionCount, setQuestionCount] = useState("30");
  const [shuffle, setShuffle] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [negativeMarking, setNegativeMarking] = useState(false);

  const topics = getTopicsForUnit(unitId);
  const subtopics = getSubtopicsForTopic(unitId, topicId);

  const handleGenerate = async () => {
    const count = Number.parseInt(questionCount, 10);
    if (!count || count < 1) {
      toast.error("Enter a valid question count");
      return;
    }
    if (
      (scope === "unit" || scope === "topic" || scope === "subtopic") &&
      !unitId
    ) {
      toast.error("Please select a unit");
      return;
    }
    if ((scope === "topic" || scope === "subtopic") && !topicId) {
      toast.error("Please select a topic");
      return;
    }

    const filter = {
      questionCount: BigInt(count),
      unitId: scope !== "full" && unitId ? unitId : undefined,
      topicId:
        (scope === "topic" || scope === "subtopic") && topicId
          ? topicId
          : undefined,
      subtopicId: scope === "subtopic" && subtopicId ? subtopicId : undefined,
      part: part !== "all" ? part : undefined,
      difficulty: difficulty !== "all" ? difficulty : undefined,
    };

    try {
      const paper = await generatePaper.mutateAsync(filter);
      if (shuffle) {
        paper.questions = [...paper.questions].sort(() => Math.random() - 0.5);
      }
      setGeneratedPaper(paper);
      toast.success(`Paper generated with ${paper.questions.length} questions`);
      navigate({ to: "/pdf-preview" });
    } catch {
      toast.error(
        "Failed to generate paper. Make sure there are enough questions.",
      );
    }
  };

  return (
    <div
      className="max-w-2xl mx-auto space-y-6"
      data-ocid="paper_generator.section"
    >
      {/* Scope */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Step 1 — Select Scope</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["full", "unit", "topic", "subtopic"] as Scope[]).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setScope(s);
                  setUnitId("");
                  setTopicId("");
                  setSubtopicId("");
                }}
                type="button"
                className={`p-3 rounded-lg border text-sm font-medium capitalize transition-colors ${
                  scope === s
                    ? "border-[oklch(0.48_0.18_255)] bg-[oklch(0.93_0.05_255)] text-[oklch(0.32_0.12_255)]"
                    : "border-border hover:bg-muted/50"
                }`}
                data-ocid={`paper_generator.scope_${s}.toggle`}
              >
                {s === "full"
                  ? "Full Syllabus"
                  : `${s.charAt(0).toUpperCase() + s.slice(1)}-wise`}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Unit / Topic / Subtopic selects */}
      {scope !== "full" && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">
              Step 2 — Select Scope Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Select
                value={unitId}
                onValueChange={(v) => {
                  setUnitId(v);
                  setTopicId("");
                  setSubtopicId("");
                }}
              >
                <SelectTrigger data-ocid="paper_generator.unit.select">
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

            {(scope === "topic" || scope === "subtopic") && (
              <div className="space-y-1.5">
                <Label>Topic</Label>
                <Select
                  value={topicId}
                  onValueChange={(v) => {
                    setTopicId(v);
                    setSubtopicId("");
                  }}
                  disabled={!unitId}
                >
                  <SelectTrigger data-ocid="paper_generator.topic.select">
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
            )}

            {scope === "subtopic" && (
              <div className="space-y-1.5">
                <Label>Subtopic</Label>
                <Select
                  value={subtopicId}
                  onValueChange={setSubtopicId}
                  disabled={!topicId}
                >
                  <SelectTrigger data-ocid="paper_generator.subtopic.select">
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
            )}
          </CardContent>
        </Card>
      )}

      {/* Part + Difficulty */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">
            Step {scope === "full" ? 2 : 3} — Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Part</Label>
            <Select value={part} onValueChange={setPart}>
              <SelectTrigger data-ocid="paper_generator.part.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Parts</SelectItem>
                <SelectItem value="A">Part A</SelectItem>
                <SelectItem value="B">Part B</SelectItem>
                <SelectItem value="C">Part C</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger data-ocid="paper_generator.difficulty.select">
                <SelectValue />
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

      {/* Count + Options */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">
            Step {scope === "full" ? 3 : 4} — Paper Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="qcount">Number of Questions</Label>
            <Input
              id="qcount"
              type="number"
              min={1}
              max={200}
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
              className="w-40"
              data-ocid="paper_generator.question_count.input"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Shuffle Questions</Label>
              <Switch
                checked={shuffle}
                onCheckedChange={setShuffle}
                data-ocid="paper_generator.shuffle.switch"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Shuffle Options</Label>
              <Switch
                checked={shuffleOptions}
                onCheckedChange={setShuffleOptions}
                data-ocid="paper_generator.shuffle_options.switch"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Negative Marking</Label>
              <Switch
                checked={negativeMarking}
                onCheckedChange={setNegativeMarking}
                data-ocid="paper_generator.negative_marking.switch"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleGenerate}
        disabled={generatePaper.isPending}
        className="w-full h-12 bg-[oklch(0.17_0.04_255)] hover:bg-[oklch(0.24_0.06_255)] text-white gap-2 text-base"
        data-ocid="paper_generator.generate.primary_button"
      >
        {generatePaper.isPending ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Generating...
          </>
        ) : (
          <>
            <Wand2 size={18} /> Generate Paper
          </>
        )}
      </Button>
    </div>
  );
}
