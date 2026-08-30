"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ChevronsLeft, LoaderPinwheel, RefreshCcwIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import WordCard from "@/components/WordCard";
import { useUser } from "@clerk/nextjs";
import SmoothFadeLayout from "@/components/SmoothFadePageTransition";
import { greetings } from "../consts";

const notifySuccess = () => toast.success("Word added successfully!");
const notifyError = (message: string) => toast.error(`${message}`);

export default function AddWord() {
  const router = useRouter();
  const wordInputRef = useRef<HTMLInputElement>(null);

  const { user } = useUser();

  const words = useQuery(api.words.getWords) || [];
  const createWord = useMutation(api.words.createWord);
  const updateCount = useMutation(api.words.updateCount);

  const [word, setWord] = useState("");
  const [spelling, setSpelling] = useState("");
  const [meaning, setMeaning] = useState("");
  const [trigger, setTrigger] = useState("");
  const [examples, setExamples] = useState<string[]>([]);

  const [debouncedWord, setDebouncedWord] = useState(word);
  const [AIDebouncedWord, setAIDebouncedWord] = useState(word);

  const [meaningExists, setMeaningExists] = useState(false);
  const [meaningLoading, setMeaningLoading] = useState(false);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [examplesLoading, setExamplesLoading] = useState(false);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const random = greetings[Math.floor(Math.random() * greetings.length)];
    setGreeting(random);
  }, []);

  useEffect(() => {
    setMeaning("");
    setTrigger("");
    setExamples([]);

    const convexSearch = setTimeout(() => {
      setDebouncedWord(word);
    }, 500);

    const aiSearch = setTimeout(() => {
      setAIDebouncedWord(word);
    }, 2000);

    return () => {
      (clearTimeout(convexSearch), clearTimeout(aiSearch));
    };
  }, [word]);

  const fetchMeaning = async () => {
    try {
      setMeaningLoading(true);
      const res = await fetch("/api/generate-meaning", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ word: AIDebouncedWord }),
      });

      if (res.status === 429)
        throw new Error(
          "Rate limit exceeded. Please wait a moment before trying again.",
        );
      if (!res.ok) throw new Error("Failed to generate meaning");
      const data = await res.json();
      setMeaning(data.definition);
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      setMeaningLoading(false);
    }
  };

  const fetchTrigger = async () => {
    try {
      setTriggerLoading(true);
      const res = await fetch("/api/generate-trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ word: AIDebouncedWord }),
      });

      if (res.status === 429)
        throw new Error(
          "Rate limit exceeded. Please wait a moment before trying again.",
        );
      if (!res.ok) throw new Error("Failed to generate trigger.");
      const data = await res.json();
      setTrigger(data.trigger);
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      setTriggerLoading(false);
    }
  };

  const fetchExamples = async () => {
    try {
      setExamplesLoading(true);
      const res = await fetch("/api/generate-examples", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ word: AIDebouncedWord }),
      });

      if (res.status === 429)
        throw new Error(
          "Rate limit exceeded. Please wait a moment before trying again.",
        );
      if (!res.ok) throw new Error("Failed to generate examples");
      const data = await res.json();
      setExamples(data.examples);
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      setExamplesLoading(false);
    }
  };

  const spellCheck = async (): Promise<string | null> => {
    setSpelling("");
    try {
      const res = await fetch("/api/spell-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ word: AIDebouncedWord }),
      });

      if (res.status === 429) {
        throw new Error(
          "Rate limit exceeded. Please wait a moment before trying again.",
        );
      }

      if (!res.ok) {
        throw new Error("Failed to check spelling");
      }

      const data = await res.json();

      if (data.status === "correction_needed") {
        setSpelling(data.suggestions[0]);
        return null;
      }

      return data.status;
    } catch (error) {
      notifyError((error as Error).message);
      return null;
    }
  };

  const fetchDerviation = async () => {
    try {
      const res = await fetch(
        `https://api.datamuse.com/words?sp=${encodeURIComponent(word.slice(0, 6))}*&md=p&max=100`,
      );
      if (!res.ok) throw new Error("Failed to fetch derivations");
      const data = await res.json();

      const base = word.toLowerCase();
      const baseRoot = base.slice(0, 5);

      // keep only clean derivations
      const derivations = data.filter((w: { word: string }) => {
        const wLower = w.word.toLowerCase();

        const valid =
          wLower.startsWith(baseRoot) && // same root
          !wLower.includes(" ") && // ignore phrases
          wLower !== base && // not the same word
          !/[^a-zA-Z]/.test(wLower) && // remove words with weird chars
          (wLower.includes("ly") ||
            wLower.includes("ness") ||
            wLower.includes("est") ||
            wLower.includes("ate") ||
            wLower.includes("acy") ||
            wLower.includes("ous")); // common derivational suffixes

        return valid;
      });

      console.log(derivations);
    } catch (error) {
      notifyError((error as Error).message);
    }
  };

  useEffect(() => {
    if (!AIDebouncedWord || meaningExists) return;

    const run = async () => {
      const status = await spellCheck();
      if (status !== "correct") return;

      await Promise.all([
        fetchDerviation(),
        fetchMeaning(),
        fetchTrigger(),
        fetchExamples(),
      ]);
    };

    run();
  }, [AIDebouncedWord]);

  const existingWords = words.map((w) => w.word.toLowerCase());
  const alreadyExists = existingWords.includes(word.toLowerCase());

  useEffect(() => {
    if (!word.trim() || !alreadyExists) {
      setMeaningExists(false);
    } else if (alreadyExists) {
      setMeaningExists(true);
    }
  }, [alreadyExists]);

  const getWord = useQuery(
    api.words.getWordByName,
    debouncedWord ? { word: debouncedWord } : "skip",
  );

  const isNumeric = (n: string) => {
    return !isNaN(parseFloat(n)) && isFinite(Number(n));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isNumeric(word.charAt(0)))
      return notifyError("We dont support that yet!");
    if (!word.trim()) return notifyError("Word cannot be empty");
    if (word.includes(" ")) return notifyError("Word cannot contain spaces");
    if (alreadyExists) return notifyError("Word already exists");
    if (meaning.trim().length === 0 || examples.length === 0)
      return notifyError(
        "Sit Tight while AI generates the meaning and examples!",
      );
    const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1);
    try {
      void createWord({
        owner: user?.id || "anonymous",
        word: capitalizedWord,
        meaning: meaning,
        trigger: trigger,
        examples: examples,
      });
      void updateCount();

      notifySuccess();
      setWord("");
      setMeaningExists(false);
    } catch (error) {
      notifyError((error as Error).message);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        wordInputRef.current?.focus();
        return;
      }

      if (e.key === "Escape") {
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        ) {
          e.target.blur();
        }
        return;
      }

      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        wordInputRef.current?.focus();
      } else if (e.key === "b") {
        router.push("/");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [router]);

  const handleRegenerateMeaning = async (type: string) => {
    try {
      if (type === "Meaning") await fetchMeaning();
      else if (type === "Trigger") await fetchTrigger();
      else await fetchExamples();
    } catch (err) {
      notifyError((err as Error).message);
    }
  };

  const handleExchange = () => {
    setWord(spelling);
    setSpelling("");
  };

  return (
    <SmoothFadeLayout>
      <main className="flex flex-col items-center justify-center text-black h-screen overflow-hidden dark:text-gray-300">
        <div className="w-full max-w-3xl mx-auto px-6">
          <Button
            variant="outline"
            className="mb-10 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <ChevronsLeft size={16} />
            Back [b]
          </Button>
        </div>
        <div className="w-full max-w-3xl mx-auto px-6">
          <h1 className="text-3xl">{greeting}</h1>
          <form className="mt-1" onSubmit={handleSubmit}>
            <div className="relative mt-5">
              <Input
                ref={wordInputRef}
                type="text"
                name="word"
                placeholder="Enter new word"
                value={word}
                onChange={(e) => {
                  setWord(e.target.value);
                }}
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded border">
                ⌘K
              </kbd>
            </div>

            {spelling && (
              <p className="mt-2 text-sm text-gray-500">
                Did you mean{" "}
                <button
                  onClick={handleExchange}
                  className="bg-slate-200 rounded-sm transition duration-150 hover:bg-slate-300 px-2 py-0.5 text-gray-700 font-medium cursor-pointer"
                >
                  {spelling}
                </button>{" "}
                ?
              </p>
            )}

            {meaning.length > 0 && (
              <section>
                <div className="mt-5 flex items-center justify-between">
                  <label className="block font-medium text-sm text-gray-700 dark:text-gray-400">
                    Definition (generated by AI)
                  </label>
                  <Button
                    type="button"
                    className="bg-opacity-0 rounded-md cursor-pointer hover:bg-white transition duration-350 text-gray-500 hover:text-gray-700"
                    onClick={() => handleRegenerateMeaning("Meaning")}
                  >
                    <RefreshCcwIcon
                      size={18}
                      className={meaningLoading ? "animate-spin" : ""}
                    />
                  </Button>
                </div>
                <div className="border-dashed border-2 rounded-md px-3 py-2 bg-white dark:bg-black text-sm flex-1">
                  <span>{meaning}</span>
                </div>
              </section>
            )}
            {meaningLoading && (
              <div className="flex items-center mt-5 text-gray-500">
                <LoaderPinwheel className="animate-spin mr-2" color="#6a7282" />
                <p>Generating definition...</p>
              </div>
            )}

            {trigger.length > 0 && (
              <section>
                <div className="mt-5 flex items-center justify-between">
                  <label className="block font-medium text-sm text-gray-700 dark:text-gray-400">
                    Trigger (generated by AI)
                  </label>
                  <Button
                    type="button"
                    className="bg-opacity-0 rounded-md cursor-pointer hover:bg-white transition duration-350 text-gray-500 hover:text-gray-700"
                    onClick={() => handleRegenerateMeaning("Trigger")}
                  >
                    <RefreshCcwIcon
                      size={18}
                      className={meaningLoading ? "animate-spin" : ""}
                    />
                  </Button>
                </div>
                <div className="border-dashed border-2 rounded-md px-3 py-2 bg-white dark:bg-black text-sm flex-1">
                  <span>{trigger}</span>
                </div>
              </section>
            )}
            {triggerLoading && (
              <div className="flex items-center mt-5 text-gray-500">
                <LoaderPinwheel className="animate-spin mr-2" color="#6a7282" />
                <p>Generating trigger...</p>
              </div>
            )}

            {examples.length > 0 && (
              <section>
                <div className="flex items-center justify-between mt-5">
                  <label className="block font-medium text-sm text-gray-700 dark:text-gray-400">
                    Example Sentences (generated by AI)
                  </label>
                  <Button
                    type="button"
                    className="bg-opacity-0 rounded-md cursor-pointer hover:bg-white transition duration-350 text-gray-500 hover:text-gray-700"
                    onClick={() => handleRegenerateMeaning("Example")}
                  >
                    <RefreshCcwIcon
                      size={18}
                      className={examplesLoading ? "animate-spin" : ""}
                    />
                  </Button>
                </div>

                <div className="space-y-2">
                  {examples.map((example, index) => {
                    const regex = new RegExp(`\\b${word}\\w*`, "gi");
                    const parts = example.split(regex);
                    const matches = example.match(regex) || [];

                    return (
                      <div
                        key={index}
                        className="border-dashed border-2 rounded-md px-3 py-2 bg-white dark:bg-black text-sm flex-1"
                      >
                        {parts.map((part, partIndex) => (
                          <span key={partIndex}>
                            {part}
                            {matches[partIndex] && (
                              <strong>{matches[partIndex]}</strong>
                            )}
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
            {examplesLoading && (
              <div className="flex items-center mt-5 text-gray-500">
                <LoaderPinwheel className="animate-spin mr-2" color="#6a7282" />
                <p>Generating example sentences...</p>
              </div>
            )}
            <Button type="submit" className="mt-5 w-full cursor-pointer">
              Add Word
            </Button>
          </form>
        </div>
        {alreadyExists && getWord && getWord?.word?.length > 0 && (
          <div className="flex flex-col mt-5 justify-center items-center">
            <WordCard
              word={getWord?.word || ""}
              meaning={getWord?.meaning || ""}
              trigger={getWord?.trigger || ""}
              examples={getWord?.examples || []}
              currentUserId={user?.id}
              ownerId={getWord?.owner}
            />
          </div>
        )}
        <Toaster position="top-right" />
      </main>
    </SmoothFadeLayout>
  );
}
