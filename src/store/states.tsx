import { create } from "zustand";

interface HelpState {
  showHelp: boolean;
  setShowHelp: (value: boolean) => void;
}

export const useHelp = create<HelpState>((set) => ({
  showHelp: false,
  setShowHelp: (value: boolean) => set({ showHelp: value }),
}))
