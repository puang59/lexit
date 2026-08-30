import nspell from "nspell";
import dictionary from "dictionary-en";

const spell = nspell({
  aff: Buffer.from(dictionary.aff),
  dic: Buffer.from(dictionary.dic),
} as any);

export function checkWord(word: string) {
  return {
    isCorrect: spell.correct(word),
    suggestions: spell.suggest(word),
  };
}
