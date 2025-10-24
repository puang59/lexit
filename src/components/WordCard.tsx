import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Trash2Icon } from "lucide-react";

interface WordCardProps {
  word: string;
  meaning: string;
  examples: string[];
  isOwner: boolean;
}

export default function WordCard({ word, meaning, examples, isOwner }: WordCardProps) {
  const deleteWord = useMutation(api.words.deleteWord);

  return (
    <div className="relative mx-10 py-2 px-5 mb-5 border border-zinc-300 rounded-sm">
      {isOwner && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteWord({ word })}
          className="absolute top-2 right-2"
        >
          <Trash2Icon size={16} className="text-red-500" />
        </Button>
      )}
      <h2 className="text-xl font-semibold pr-10">{word}</h2>
      <p className="italic mb-2 font-medium">{meaning}</p>
      <ul className="list-disc list-inside">
        {examples.map((example, index) => (
          <li key={index} className="mb-1">
            {example}
          </li>
        ))}
      </ul>
    </div>
  );
}
