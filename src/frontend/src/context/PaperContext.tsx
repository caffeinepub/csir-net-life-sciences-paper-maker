import type React from "react";
import { createContext, useContext, useState } from "react";
import type { PaperGenerationRequest } from "../backend.d";

interface PaperContextType {
  generatedPaper: PaperGenerationRequest | null;
  setGeneratedPaper: (paper: PaperGenerationRequest | null) => void;
}

const PaperContext = createContext<PaperContextType>({
  generatedPaper: null,
  setGeneratedPaper: () => {},
});

export function PaperProvider({ children }: { children: React.ReactNode }) {
  const [generatedPaper, setGeneratedPaper] =
    useState<PaperGenerationRequest | null>(null);
  return (
    <PaperContext.Provider value={{ generatedPaper, setGeneratedPaper }}>
      {children}
    </PaperContext.Provider>
  );
}

export const usePaper = () => useContext(PaperContext);
