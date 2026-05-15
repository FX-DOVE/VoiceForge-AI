import { create } from "zustand";

export const useCloningStore = create((set) => ({
  sampleFiles: [],
  cloneId: null,
  voiceName: "",
  visibility: "private",
  description: "",
  setSampleFiles: (files) => set({ sampleFiles: files }),
  setCloneId: (cloneId) => set({ cloneId }),
  setVoiceName: (voiceName) => set({ voiceName }),
  setVisibility: (visibility) => set({ visibility }),
  setDescription: (description) => set({ description }),
  reset: () =>
    set({
      sampleFiles: [],
      cloneId: null,
      voiceName: "",
      visibility: "private",
      description: "",
    }),
}));
