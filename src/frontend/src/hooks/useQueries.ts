import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  PaperFilter,
  Question,
  QuestionCountStats,
  Settings,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllQuestions(searchText = "") {
  const { actor, isFetching } = useActor();
  return useQuery<Question[]>({
    queryKey: ["questions", searchText],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchQuestions(searchText);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetQuestionStats() {
  const { actor, isFetching } = useActor();
  return useQuery<QuestionCountStats[]>({
    queryKey: ["questionStats"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getQuestionStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSettings() {
  const { actor, isFetching } = useActor();
  return useQuery<Settings>({
    queryKey: ["settings"],
    queryFn: async () => {
      if (!actor)
        return {
          watermarkText: "",
          instituteName: "",
          negativeMarkingValue: 0.25,
          negativeMarkingEnabled: false,
          footerText: "",
        };
      return actor.getSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateSettings() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Settings) => {
      if (!actor) throw new Error("No actor");
      return actor.updateSettings(settings);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });
}

export function useCreateQuestion() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (q: Question) => {
      if (!actor) throw new Error("No actor");
      return actor.createQuestion(q);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["questions"] });
      qc.invalidateQueries({ queryKey: ["questionStats"] });
    },
  });
}

export function useUpdateQuestion() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (q: Question) => {
      if (!actor) throw new Error("No actor");
      return actor.updateQuestion(q);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["questions"] });
      qc.invalidateQueries({ queryKey: ["questionStats"] });
    },
  });
}

export function useDeleteQuestion() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteQuestion(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["questions"] });
      qc.invalidateQueries({ queryKey: ["questionStats"] });
    },
  });
}

export function useGeneratePaper() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (filter: PaperFilter) => {
      if (!actor) throw new Error("No actor");
      return actor.generatePaper(filter);
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}
