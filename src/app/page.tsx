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
import { useShortcuts } from "@/utility/KeyboardShortcutProvider";
import { useDebounce } from "@/hooks/useDebounce";
import { useStates } from "@/store/states";

import dynamic from "next/dynamic";
const HelpDialog = dynamic(() => import ("@/components/HelpDialog"), {
  ssr: false,
}) 

export default function Home() {
  const router = useRouter();
  const wordListRef = useRef<HTMLDivElement>(null);

  const { user } = useUser();

  const [allWords, setAllWords] = useState<any[]>([]);
  const [lastId, setLastId] = useState<string | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const WORDS_PER_PAGE = 20;

  const { query, setQuery, searchInputRef } = useShortcuts();
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const debounceQuery = useDebounce(query, 300);

  const words = useQuery(api.words.lazyLoadWords, {
    limit: WORDS_PER_PAGE,
    startsAfterId: lastId,
    searchQuery: debounceQuery|| undefined,
    selectedLetter: selectedLetter || undefined,
  });
  const wordsCount = useQuery(api.words.getTotalWordCount) || 0;

  useEffect(() => {
    setAllWords([]);
    setLastId(undefined);
    setHasMore(true);
    setIsLoadingMore(false);
  }, [debounceQuery, selectedLetter]);

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

  useEffect(() => {
    const wordList = wordListRef.current;
    if (wordList) {
      wordList.addEventListener("scroll", handleScroll, {passive: true});
      return () => wordList.removeEventListener("scroll", handleScroll);
    }
  }, [allWords, isLoadingMore, hasMore]);

  const {scrollPosition, setScrollPosition} = useStates();

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
    if (wordListRef.current && scrollPosition > 0 && allWords.length > 0) {
      wordListRef.current.scrollTop = scrollPosition;
    }
  }, [allWords.length, scrollPosition])

  return (
    <SmoothFadeLayout>
      <main className="flex flex-col items-center justify-center text-black h-screen overflow-hidden">
        <header className="flex justify-end items-center p-4 gap-4 h-16 w-full max-w-3xl mx-auto">
          <NavBar />
          <SignedOut>
            <SignInButton>
              <Button variant="outline" className="dark:text-white">
                Sign In
              </Button>
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
          <Image
            src="/logo.png"
            alt="Lexit Logo"
            width={80}
            height={80}
            className="dark:invert"
          />
          {wordsCount && (
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
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
                className="dark:text-gray-300"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded border">
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
                      trigger={word.trigger}
                      examples={word.examples}
                      currentUserId={user?.id}
                      ownerId={word.owner}
                    />
                  ))}
                </ul>
                {(isLoadingMore || words === undefined) && (
                  <div className="flex justify-center py-4">
                    <Loader />
                  </div>
                )}
              </>
            ) : words === undefined ? (
              <div className="flex justify-center py-4">
                <Loader />
              </div>
            ) : (
                  <p className="flex items-center justify-center">
                    No words found
                  </p>
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
          onClick={() => {
            if (wordListRef.current) setScrollPosition(wordListRef.current.scrollTop);

            router.push("/add-word")}
          }
        >
          <Plus size={16} />
        </Button>

        <HelpDialog />
      </main>
    </SmoothFadeLayout>
  );
}
