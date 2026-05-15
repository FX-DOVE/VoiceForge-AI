import { create } from "zustand";

export const useCloningStore = create((set) => ({
  sampleFiles: [],
  voiceName: "",
  visibility: "private",
  description: "",
  setSampleFiles: (files) => set({ sampleFiles: files }),
  setVoiceName: (voiceName) => set({ voiceName }),
  setVisibility: (visibility) => set({ visibility }),
  setDescription: (description) => set({ description }),
  reset: () =>
    set({
      sampleFiles: [],
      voiceName: "",
      visibility: "private",
      description: "",
    }),
}));
