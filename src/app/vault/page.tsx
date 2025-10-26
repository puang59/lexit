"use client";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import WordCard from "@/components/WordCard";
import AlphabetFilter from "@/components/AlphabetFilter";
import { useState, useRef, useEffect } from "react";
import Loader from "@/components/Loader";
import SmoothFadeLayout from "@/components/SmoothFadePageTransition";

export default function Vault() {
  const { user } = useUser();
  const wordListRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [allWords, setAllWords] = useState<any[]>([]);
  const [lastId, setLastId] = useState<string | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const WORDS_PER_PAGE = 20;

  const words = useQuery(
    api.words.lazyLoadUserWords,
    user
      ? {
          owner: user.id,
          limit: WORDS_PER_PAGE,
          startsAfterId: lastId,
          searchQuery: query || undefined,
          selectedLetter: selectedLetter || undefined,
        }
      : "skip"
  );

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
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        searchInputRef.current?.focus();
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
        setQuery("");
        return;
      }

      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (event.key === "/") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <SmoothFadeLayout>
      <main className="flex flex-col items-center justify-center text-black h-screen overflow-hidden">
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

        <div className="flex flex-col justify-center items-center mt-5 w-full max-w-3xl mx-auto px-6">
          <h1 className="text-2xl font-bold">Word Vault</h1>
          {user && (
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Welcome, {user.firstName}! Here are your saved words.
            </p>
          )}

          {/* Search Input */}
          <form className="flex mb-6 mt-4 gap-2 w-full">
            <div className="relative flex-1">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="search your words"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="dark:text-white"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded border">
                ⌘K
              </kbd>
            </div>
            <Button type="submit" className="cursor-pointer">
              search
            </Button>
          </form>

          {/* Words List */}
          <div
            ref={wordListRef}
            className="w-full max-w-3xl mx-auto max-h-[55vh] overflow-y-auto"
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

          {/* Alphabet Filter */}
          {allWords.length > 0 && (
            <div className="mt-4">
              <AlphabetFilter
                words={allWords}
                selectedLetter={selectedLetter}
                onLetterSelect={setSelectedLetter}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-auto mb-10 ml-auto mx-5"></footer>
      </main>
    </SmoothFadeLayout>
  );
}
