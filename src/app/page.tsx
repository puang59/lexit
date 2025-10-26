"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import WordCard from "@/components/WordCard";
import AlphabetFilter from "@/components/AlphabetFilter";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import Loader from "@/components/Loader";
import SmoothFadeLayout from "@/components/SmoothFadePageTransition";

export default function Home() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const wordListRef = useRef<HTMLDivElement>(null);

  const { user } = useUser();

  const [allWords, setAllWords] = useState<any[]>([]);
  const [lastId, setLastId] = useState<string | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const WORDS_PER_PAGE = 20;

  const [query, setQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const words = useQuery(api.words.lazyLoadWords, {
    limit: WORDS_PER_PAGE,
    startsAfterId: lastId,
    searchQuery: query || undefined,
    selectedLetter: selectedLetter || undefined,
  });
  const wordsCount = useQuery(api.words.getTotalWordCount) || 0;

  useEffect(() => {
    setAllWords([]);
    setLastId(undefined);
    setHasMore(true);
    setIsLoadingMore(false);
  }, [query, selectedLetter]);

  useEffect(() => {
    if (words && words.length > 0) {
      setAllWords((prev) => {
        if (lastId === undefined) {
          return words;
        }
        const existingIds = new Set(prev.map((w) => w._id));
        const newWords = words.filter((w) => !existingIds.has(w._id));
        return [...prev, ...newWords];
      });
      setIsLoadingMore(false);

      if (words.length < WORDS_PER_PAGE) {
        setHasMore(false);
      }
    }
  }, [words]);

  const handleScroll = () => {
    if (!wordListRef.current || isLoadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = wordListRef.current;
    const scrolledToBottom = scrollHeight - scrollTop - clientHeight < 200;

    if (scrolledToBottom && allWords.length > 0) {
      setIsLoadingMore(true);
      const lastWord = allWords[allWords.length - 1];
      setLastId(lastWord._id);
    }
  };

  useEffect(() => {
    const wordList = wordListRef.current;
    if (wordList) {
      wordList.addEventListener("scroll", handleScroll);
      return () => wordList.removeEventListener("scroll", handleScroll);
    }
  }, [allWords, isLoadingMore, hasMore]);

  const isOwner = (ownerId: string) => {
    if (ownerId === user?.id) return true;
    return false;
  };

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
  }, [router, showHelp, setQuery]);

  return (
    <SmoothFadeLayout>
      <main className="flex flex-col items-center justify-center md:text-black text-white h-screen overflow-hidden">
        <header className="flex justify-end items-center p-4 gap-4 h-16 w-full max-w-3xl mx-auto">
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
        <div className="flex flex-col justify-center items-center w-full max-w-3xl mx-auto px-6">
          <Image src="/logo.png" alt="Lexit Logo" width={80} height={80} />
          {wordsCount && (
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
              Total {wordsCount} words
            </p>
          )}
          <form className="flex mb-10 mt-5 gap-2 w-full">
            <div className="relative flex-1">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="search words"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="dark:text-white"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-500 text-xs px-1.5 py-0.5 rounded border">
                ⌘K
              </kbd>
            </div>
            <Button type="submit" className="cursor-pointer">
              search
            </Button>
          </form>
        </div>

        {/* Words List */}
        <div
          ref={wordListRef}
          className="w-full max-w-3xl mx-auto max-h-[65vh] overflow-y-auto"
          data-word-list
        >
          {allWords.length > 0 ? (
            <>
              <ul>
                {allWords.map((word) => (
                  <WordCard
                    key={word._id}
                    word={word.word}
                    meaning={word.meaning}
                    examples={word.examples}
                    isOwner={isOwner(word.owner || "")}
                  />
                ))}
              </ul>
              {isLoadingMore && (
                <div className="flex justify-center py-4">
                  <Loader />
                </div>
              )}
            </>
          ) : (
            <div>
              <p className="flex items-center justify-center">
                {selectedLetter &&
                  `No words found starting with "${selectedLetter}".`}
              </p>
              <Loader />
            </div>
          )}
        </div>

        {/* Footer with Alphabet Filter */}
        <footer className="mt-auto mb-6 w-full flex items-center justify-center">
          <div className="w-full max-w-3xl mx-auto px-6 flex justify-center">
            {allWords.length > 0 && (
              <AlphabetFilter
                words={allWords}
                selectedLetter={selectedLetter}
                onLetterSelect={setSelectedLetter}
              />
            )}
          </div>
        </footer>

        {/* Fixed Add Button */}
        <Button
          size="icon"
          className="fixed bottom-20 right-6 rounded-full cursor-pointer z-50"
          onClick={() => router.push("/add-word")}
        >
          <Plus size={16} />
        </Button>

        {/* Help Dialog */}
        {showHelp && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-black rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold dark:text-white">Keyboard Shortcuts</h3>
                <button
                  type="button"
                  onClick={() => setShowHelp(false)}
                  onKeyDown={(e) => e.key === "Enter" && setShowHelp(false)}
                  className="text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Close help dialog"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="dark:text-white">Focus search</span>
                  <div className="flex gap-1">
                    <kbd className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded border">
                      ⌘K
                    </kbd>
                    <kbd className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded border">
                      /
                    </kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="dark:text-white">Clear search</span>
                  <kbd className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-4000 text-xs px-2 py-1 rounded border">
                    Esc
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="dark:text-white">Add new word</span>
                  <div className="flex gap-1">
                    <kbd className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded border">
                      +
                    </kbd>
                    <kbd className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded border">
                      A
                    </kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="dark:text-white">Scroll through words</span>
                  <div className="flex gap-1">
                    <kbd className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded border">
                      J
                    </kbd>
                    <kbd className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded border">
                      K
                    </kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="dark:text-white">Show this help</span>
                  <kbd className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded border">
                    Shift + ?
                  </kbd>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t text-xs text-gray-500 dark:text-gray-400 text-center">
                Press{" "}
                <kbd className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-xs px-1 py-0.5 rounded border">
                  Esc
                </kbd>{" "}
                or click outside to close
              </div>
            </div>
          </div>
        )}
      </main>
    </SmoothFadeLayout>
  );
}
