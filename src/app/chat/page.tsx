"use client";

import SmoothFadeLayout from "@/components/SmoothFadePageTransition";
import NavBar from "@/components/NavBar";
import { SignedOut, SignInButton, SignUpButton, SignedIn, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import HelpDialog from "@/components/HelpDialog";
import { useShortcuts } from "@/utility/KeyboardShortcutProvider";

export default function ChatPage() {
  const chatInputRef = useRef<HTMLInputElement>(null);

  const { query, setQuery } = useShortcuts();

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
          <form className="flex mb-10 mt-5 gap-2 w-full">
            <div className="relative flex-1">
              <Input
                ref={chatInputRef}
                type="text"
                placeholder="chat here..."
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

        <HelpDialog />
      </main>
    </SmoothFadeLayout>
  );
}
