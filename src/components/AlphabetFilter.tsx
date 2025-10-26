"use client";

import { Button } from "@/components/ui/button";

interface AlphabetFilterProps {
  words: Array<{ word: string }>;
  selectedLetter: string | null;
  onLetterSelect: (letter: string | null) => void;
}

export default function AlphabetFilter({
  words,
  selectedLetter,
  onLetterSelect,
}: AlphabetFilterProps) {
  // Get unique first letters from words
  const availableLetters = Array.from(
    new Set(
      words
        .map((word) => word.word.charAt(0).toUpperCase())
        .filter((letter) => /[A-Z]/.test(letter))
    )
  ).sort();

  if (availableLetters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-center items-center gap-1 mt-4 mb-4 px-4">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-3">Filter by:</span>

      <Button
        variant={selectedLetter === null ? "default" : "outline"}
        size="sm"
        onClick={() => onLetterSelect(null)}
        className="text-xs px-3 py-1 h-7 cursor-pointer"
      >
        All
      </Button>

      {availableLetters.map((letter) => (
        <Button
          key={letter}
          variant={selectedLetter === letter ? "default" : "outline"}
          size="sm"
          onClick={() => onLetterSelect(letter)}
          className="text-xs px-2 py-1 h-7 min-w-[28px] cursor-pointer dark:text-white"
        >
          {letter}
        </Button>
      ))}
    </div>
  );
}
