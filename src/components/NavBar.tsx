import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "./ui/button";
import Toggle from "./Toggle";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if no input/textarea is focused
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "h") {
        router.push("/");
      } else if (e.key === "v") {
        router.push("/vault");
      } else if (e.key === "c") {
        router.push("/contributors");
      } else if (e.key === "f") {
        router.push("/flashcard");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [router]);

  return (
    <nav className="w-full flex items-center justify-between dark:text-gray-200">
      <div className="flex items-center overflow-x-auto no-scrollbar whitespace-nowrap gap-1 pr-2">
        <Button
          variant="ghost"
          className={
            pathname === "/"
              ? "underline font-bold text-md hover:bg-white cursor-pointer px-2 sm:px-4"
              : "text-md hover:bg-white cursor-pointer px-2 sm:px-4"
          }
          onClick={() => router.push("/")}
        >
          {" "}
          Home {pathname !== "/" && <span className="hidden sm:inline pl-1">[h]</span>}
        </Button>
        <Button
          variant="ghost"
          className={
            pathname === "/flashcard"
              ? "underline font-bold text-md hover:bg-white cursor-pointer px-2 sm:px-4"
              : "text-md hover:bg-white cursor-pointer px-2 sm:px-4"
          }
          onClick={() => router.push("/flashcard")}
        >
          {" "}
          Flashcard {pathname !== "/flashcard" && <span className="hidden sm:inline pl-1">[f]</span>}
        </Button>
        <Button
          variant="ghost"
          className={
            pathname === "/vault"
              ? "underline font-bold text-md hover:bg-white cursor-pointer px-2 sm:px-4"
              : "text-md hover:bg-white cursor-pointer px-2 sm:px-4"
          }
          onClick={() => router.push("/vault")}
        >
          {" "}
          Vault {pathname !== "/vault" && <span className="hidden sm:inline pl-1">[v]</span>}
        </Button>
        <Button
          variant="ghost"
          className={
            pathname === "/contributors"
              ? "underline font-bold text-md hover:bg-white cursor-pointer px-2 sm:px-4"
              : "text-md hover:bg-white cursor-pointer px-2 sm:px-4"
          }
          onClick={() => router.push("/contributors")}
        >
          {" "}
          Contributors {pathname !== "/contributors" && <span className="hidden sm:inline pl-1">[c]</span>}
        </Button>
      </div>
      <div className="flex-shrink-0">
        <Toggle />
      </div>

    </nav>
  );
}
