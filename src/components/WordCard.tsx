import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Trash2Icon, Volume2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { cx } from "class-variance-authority";

interface WordCardProps {
  word: string;
  meaning: string;
  examples: string[];
  isOwner: boolean;
}

export default function WordCard({
  word,
  meaning,
  examples,
  isOwner,
}: WordCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const deleteWord = useMutation(api.words.deleteWord);

  const speakWord = () => {
    if (!window.speechSynthesis) {
      toast.error("Speech synthesis not supported in your browser");
      return;
    }

    // Cancel any ongoing speech synthesis
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      toast.error(event.error);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="relative mx-10 py-2 px-5 mb-5 border border-zinc-300 dark:border-zinc-600 rounded-sm">
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
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold dark:text-white">{word}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => speakWord()}
          disabled={isSpeaking}
        >
          <Volume2
            size={16}
            className={cx("text-black dark:text-white", isSpeaking && "text-gray-900 dark:text-gray-500")}
          />
        </Button>
      </div>
      <p className="italic mb-2 dark:text-white">{meaning}</p>
      <ul className="list-disc list-inside dark:text-white">
        {examples.map((example, index) => {
          const regex = new RegExp(`\\b${word}\\w*`, "gi");
          const parts = example.split(regex);
          const matches = example.match(regex) || [];

          return (
            <li
              key={index}
              className="mb-1"
            >
              <span>
                {parts.map((part, i) => (
                  <span key={i}>
                    {part}
                    {i < matches.length && (
                      <strong className="font-semibold">
                        {matches[i]}
                      </strong>
                    )}
                  </span>
                ))}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  );
}
