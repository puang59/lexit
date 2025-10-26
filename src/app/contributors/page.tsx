"use client";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/NavBar";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import Image from "next/image";
import SmoothFadeLayout from "@/components/SmoothFadePageTransition";

export default function Contributors() {
  const [contributors, setContributors] = useState([]);

  useEffect(() => {
    const getContributors = async () => {
      const res = await fetch("/api/contributors");
      const data = await res.json();
      setContributors(data.contributors);
    };

    getContributors();
  }, []);

  return (
    <SmoothFadeLayout>
      <main className="flex flex-col items-center justify-center text-black dark:text-white h-screen overflow-hidden">
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
          <h1 className="text-2xl font-bold">Contributors</h1>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-300">
            A big thank you to all the amazing contributors who have helped make
            this project possible!
          </p>
        </div>

        <div className="flex flex-col justify-center items-center w-full max-w-3xl mx-auto px-6">
          <div className="flex flex-col justify-center items-center w-full max-w-3xl mx-auto px-6">
            {contributors.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-6 gap-x-4 mt-6 w-full max-w-3xl mx-auto px-6">
                {contributors.map((contributor: any) => (
                  <a
                    key={contributor.name}
                    href={contributor.profile}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="flex flex-col items-center">
                      <Image
                        src={contributor.avatar}
                        alt={contributor.name}
                        width={80}
                        height={80}
                        className="rounded-sm"
                        placeholder="blur"
                        blurDataURL="https:/wikipedia/commons/8/89/Portrait_Placeholder.png"
                      />
                      <p className="mt-2 text-center">{contributor.name}</p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 w-full">
                <Loader />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto mb-10 ml-auto mx-5"></footer>
      </main>
    </SmoothFadeLayout>
  );
}
