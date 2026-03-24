import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { Subtopic, SyllabusUnit, Topic } from "../backend.d";
import { useActor } from "../hooks/useActor";

interface SyllabusContextType {
  syllabus: SyllabusUnit[];
  loading: boolean;
  getTopicsForUnit: (unitId: string) => Topic[];
  getSubtopicsForTopic: (unitId: string, topicId: string) => Subtopic[];
}

const SyllabusContext = createContext<SyllabusContextType>({
  syllabus: [],
  loading: true,
  getTopicsForUnit: () => [],
  getSubtopicsForTopic: () => [],
});

export function SyllabusProvider({ children }: { children: React.ReactNode }) {
  const { actor, isFetching } = useActor();
  const [syllabus, setSyllabus] = useState<SyllabusUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor || isFetching) return;
    actor
      .getSyllabus()
      .then((data) => {
        setSyllabus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [actor, isFetching]);

  const getTopicsForUnit = (unitId: string) =>
    syllabus.find((u) => u.id === unitId)?.topics ?? [];

  const getSubtopicsForTopic = (unitId: string, topicId: string) =>
    getTopicsForUnit(unitId).find((t) => t.id === topicId)?.subtopics ?? [];

  return (
    <SyllabusContext.Provider
      value={{ syllabus, loading, getTopicsForUnit, getSubtopicsForTopic }}
    >
      {children}
    </SyllabusContext.Provider>
  );
}

export const useSyllabus = () => useContext(SyllabusContext);
