import { create } from "zustand";

interface HelpState {
  showHelp: boolean;
  setShowHelp: (value: boolean) => void;
}

interface States{
  scrollPosition: number; 
  setScrollPosition: (value: number) => void;
}

export const useHelp = create<HelpState>((set) => ({
  showHelp: false,
  setShowHelp: (value: boolean) => set({ showHelp: value }),
}))

export const useStates = create<States>((set) => ({
  scrollPosition: 0,
  setScrollPosition: (value: number) => set({scrollPosition: value})
}))