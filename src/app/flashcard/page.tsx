"use client";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import SmoothFadeLayout from "@/components/SmoothFadePageTransition";
import HelpDialog from "@/components/HelpDialog";

export default function Flashcard() {
  const { user } = useUser();
  const [onlyVault, setOnlyVault] = useState(false);

  const allWords = useQuery(api.words.getWords);
  const userWords = useQuery(
    api.words.getUserWord,
    user?.id ? { owner: user.id } : "skip"
  );

  const currentList = useMemo(() => {
    if (onlyVault && userWords) return userWords;
    if (!onlyVault && allWords) return allWords;
    return [];
  }, [onlyVault, userWords, allWords]);

  const [currentIndex, setCurrentIndex] = useState(-1);
  const [revealed, setRevealed] = useState({ meaning: false, trigger: false, examples: false });

  // Pick random word
  const nextWord = () => {
    if (currentList && currentList.length > 0) {
      const randomIndex = Math.floor(Math.random() * currentList.length);
      setCurrentIndex(randomIndex);
      setRevealed({ meaning: false, trigger: false, examples: false });
    }
  };

  useEffect(() => {
    // Initial load next word when list populates
    if (currentList && currentList.length > 0 && currentIndex === -1) {
      nextWord();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentList, currentIndex]);

  const toggleVault = () => {
    if (!user) {
      alert("Please sign in to use your vault.");
      return;
    }
    setOnlyVault(!onlyVault);
    setCurrentIndex(-1); // resetting to trigger picking a new word
  };

  const wordData = currentList && currentIndex !== -1 ? currentList[currentIndex] : null;

  // Handle Enter/Space to reveal or next
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't intercept if an input is focused
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault();

        setRevealed(prev => {
          if (!prev.meaning) return { ...prev, meaning: true };
          if (!prev.trigger) return { ...prev, trigger: true };
          if (!prev.examples && wordData?.examples && wordData.examples.length > 0) return { ...prev, examples: true };

          nextWord();
          return prev;
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [revealed, currentList, wordData]);

  return (
    <SmoothFadeLayout>
      <main className="flex flex-col items-center justify-center text-black h-screen overflow-hidden dark:text-gray-200">
        <header className="flex justify-end items-center p-2 sm:p-4 gap-2 sm:gap-4 h-16 w-full max-w-4xl mx-auto">
          <NavBar />
          <SignedOut>
            <SignInButton>
              <Button variant="outline">Sign In</Button>
            </SignInButton>
            <SignUpButton>
              <Button>Sign Up</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </header>

        <div className="flex flex-col flex-1 items-center justify-center w-full max-w-lg mx-auto px-4 mt-4 sm:mt-0">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-lg font-medium">Choose only from vault:</span>
            <button
              className={`w-14 h-7 rounded-full p-1 transition-colors border shadow-inner ${onlyVault ? 'bg-black border-black dark:bg-white dark:border-white' : 'bg-gray-200 border-gray-300 dark:bg-gray-800 dark:border-gray-700'}`}
              onClick={toggleVault}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white dark:bg-black shadow transition-transform ${onlyVault ? 'translate-x-7' : 'translate-x-0'}`}
              />
            </button>
          </div>

          {!currentList ? (
            <div className="text-lg">Loading words...</div>
          ) : currentList.length === 0 ? (
            <div className="text-lg text-gray-500">No words found in your selected list.</div>
          ) : !wordData ? (
            <div className="text-lg">Loading...</div>
          ) : (
            <div
              className="flex flex-col w-full bg-transparent border-2 border-dotted border-zinc-300 dark:border-zinc-700 rounded-lg p-5 sm:p-8 text-center gap-5 relative"
            >
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight break-words">{wordData.word}</h2>

              <div className="flex flex-col gap-5 text-base sm:text-lg relative z-10 w-full mt-2 text-left">

                {/* Meaning Section */}
                <div
                  className="relative cursor-pointer group"
                  onClick={() => setRevealed(prev => ({ ...prev, meaning: true }))}
                >
                  <span className="font-semibold text-zinc-500 text-sm block uppercase tracking-wide mb-1">Meaning</span>
                  <div className={`transition-all duration-300 ease-in-out ${!revealed.meaning ? 'blur-[6px] select-none opacity-40' : 'blur-0 opacity-100'}`}>
                    <p className="text-zinc-800 dark:text-zinc-200">{wordData.meaning}</p>
                  </div>
                </div>

                {/* Trigger Section */}
                <div
                  className="relative cursor-pointer group border-t border-zinc-200 dark:border-zinc-800 pt-4"
                  onClick={() => setRevealed(prev => ({ ...prev, trigger: true }))}
                >
                  <span className="font-semibold text-zinc-500 text-sm block uppercase tracking-wide mb-1">Trigger</span>
                  <div className={`transition-all duration-300 ease-in-out ${!revealed.trigger ? 'blur-[6px] select-none opacity-40' : 'blur-0 opacity-100'}`}>
                    <p className="text-zinc-800 dark:text-zinc-300 italic">{wordData.trigger}</p>
                  </div>
                </div>

                {/* Examples Section */}
                {wordData.examples && wordData.examples.length > 0 && (
                  <div
                    className="relative cursor-pointer group border-t border-zinc-200 dark:border-zinc-800 pt-4"
                    onClick={() => setRevealed(prev => ({ ...prev, examples: true }))}
                  >
                    <span className="font-semibold text-zinc-500 text-sm block uppercase tracking-wide mb-2">Examples</span>
                    <div className={`transition-all duration-300 ease-in-out ${!revealed.examples ? 'blur-[6px] select-none opacity-40' : 'blur-0 opacity-100'}`}>
                      <ul className="text-left flex flex-col gap-1 list-disc list-inside">
                        {wordData.examples.map((ex: string, i: number) => {
                          const regex = new RegExp(`\\b${wordData.word}\\w*`, "gi");
                          const parts = ex.split(regex);
                          const matches = ex.match(regex) || [];
                          return (
                            <li key={i} className="text-zinc-800 dark:text-zinc-300">
                              <span>
                                {parts.map((part, i) => (
                                  <span key={i}>
                                    {part}
                                    {i < matches.length && (
                                      <strong className="font-semibold">{matches[i]}</strong>
                                    )}
                                  </span>
                                ))}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-4 h-14">
            <Button
              variant="outline"
              className="px-8 py-6 text-lg font-medium transition-all rounded-sm border-zinc-300 dark:border-zinc-800"
              onClick={(e) => {
                e.stopPropagation();
                nextWord();
              }}
              disabled={!currentList || currentList.length === 0}
            >
              Next Word
            </Button>
          </div>
        </div>
        <HelpDialog />
      </main>
    </SmoothFadeLayout>
  );
}
