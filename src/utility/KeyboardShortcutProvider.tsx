'use client';
import { useHelp } from "@/store/states";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"

interface ShortcutContextType {
  query: string;
  setQuery: (query: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}
const ShortcutContext = createContext<ShortcutContextType | undefined>(undefined)

export function KeyboardShortcutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const {showHelp, setShowHelp} = useHelp();

  const [query, setQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null);

  const showHelpRef = useRef(showHelp);
  showHelpRef.current = showHelp; 

  const contextValue = useMemo(
    () => ({query, setQuery, searchInputRef}), 
    [query]
  )

  useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        const wordList = document.querySelector("[data-word-list]");

        if (event.key === "k") {
          if (event.metaKey || event.ctrlKey) {
            event.preventDefault();
            searchInputRef.current?.focus();
          } else {
            if (
              event.target instanceof HTMLInputElement ||
              event.target instanceof HTMLTextAreaElement
            ) {
              return;
            }
            event.preventDefault();
            if (wordList) {
              wordList.scrollBy({ top: -100, behavior: "smooth" });
            }
          }
          return;
        }

        if (event.key === "Escape") {
          if (
            event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLTextAreaElement
          ) {
            event.target.blur();
            return;
          }
          if (showHelp) {
            setShowHelp(false);
          } else {
            setQuery("");
          }
          return;
        }

        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        ) {
          return;
        }

        switch (event.key) {
          case "/":
            event.preventDefault();
            searchInputRef.current?.focus();
            break;
          case "Enter":
            if (searchInputRef.current === document.activeElement) {
              event.preventDefault();
            }
            break;
          case "+":
          case "a":
          case "A":
            event.preventDefault();
            router.push("/add-word");
            break;
          case "j":
          case "J":
            event.preventDefault();
            if (wordList) {
              wordList.scrollBy({ top: 100, behavior: "smooth" });
            }
            break;
          case "?":
            if (event.shiftKey) {
              event.preventDefault();
              setShowHelp(!showHelp);
            }
            break;
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [router, setShowHelp]);

  return (
    <ShortcutContext.Provider value={contextValue}>
      {children}
    </ShortcutContext.Provider>
  )
}

export function useShortcuts() {
  const context = useContext(ShortcutContext);
  if (!context) {
    throw new Error("useShortcuts must be used within a KeyboardShortcutProvider")
  }
  return context
}
