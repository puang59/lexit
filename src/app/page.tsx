"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
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

export default function Home() {
  const router = useRouter();

  const { user } = useUser();

  const words = useQuery(api.words.getWords) || [];
  const wordsCount = useQuery(api.words.getTotalWordCount) || 0;

  const [query, setQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const filteredWords = words.filter((word) => {
    const matchesQuery = word.word.toLowerCase().includes(query.toLowerCase());
    const matchesLetter =
      selectedLetter === null ||
      word.word.charAt(0).toUpperCase() === selectedLetter;
    return matchesQuery && matchesLetter;
  });

  const isOwner = (ownerId: string) => {
    if (ownerId === user?.id) return true;
    return false;
  };

  return (
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
      <div className="flex flex-col justify-center items-center w-full max-w-3xl mx-auto px-6">
        <Image src="/logo.png" alt="Lexit Logo" width={60} height={60} />
        {wordsCount && (
          <p className="mt-1 text-sm text-gray-600">Total {wordsCount} words</p>
        )}
        <form className="flex my-4 gap-2 w-full">
          <Input
            type="text"
            placeholder="search words"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit">search</Button>
        </form>
      </div>

      {/* Words List */}
      <div className="w-full max-w-3xl mx-auto max-h-[70vh] overflow-y-auto">
        {filteredWords.length > 0 ? (
          <ul>
            {filteredWords.reverse().map((word) => (
              <WordCard
                key={word.word}
                word={word.word}
                meaning={word.meaning}
                examples={word.examples}
                isOwner={isOwner(word.owner || "")}
              />
            ))}
          </ul>
        ) : (
          <p className="flex items-center justify-center">
            {selectedLetter
              ? `No words found starting with "${selectedLetter}".`
              : "No words found."}
          </p>
        )}
      </div>

      {/* Footer with Alphabet Filter */}
      <footer className="mt-auto mb-6 w-full flex items-center justify-between">
        <div className="w-full max-w-3xl mx-auto px-6 flex justify-center">
          {words.length > 0 && (
            <AlphabetFilter
              words={words}
              selectedLetter={selectedLetter}
              onLetterSelect={setSelectedLetter}
            />
          )}
        </div>
        <Button
          size="icon"
          className="rounded-full shrink-0 mr-6 mb-2"
          onClick={() => router.push("/add-word")}
        >
          <Plus size={16} />
        </Button>
      </footer>
    </main>
  );
}
