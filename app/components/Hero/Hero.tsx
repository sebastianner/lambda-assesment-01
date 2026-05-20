"use client";

import { useCallback, useState } from "react";
import BackgroundAnimation from "../SuperintelligenceBackground/SuperintelligenceBackground";
import AnimatedLetter from "./AnimatedLetter";
import Link from "next/link";

const LETTER_COUNT = 3;

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const advance = useCallback(
    () => setActiveIndex((i) => (i + 1) % LETTER_COUNT),
    [],
  );

  return (
    <section className="relative w-full overflow-hidden bg-black border-b border-(--color-background-gray)">
      <BackgroundAnimation className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-dvh px-4 py-24 text-center text-(--color-beige) font-inter pointer-events-none">
        <p className="mb-4 text-lg font-bold tracking-wide sm:tracking-widest">
          Supercomputers for training and inference
        </p>

        <h1 className="max-w-5xl text-[2rem] font-bold leading-tight tracking-tight text-(--color-beige) sm:text-5xl lg:text-8xl">
          The S
          <AnimatedLetter
            letter="u"
            isActive={activeIndex === 0}
            onComplete={advance}
          />
          perintellig
          <AnimatedLetter
            letter="e"
            isActive={activeIndex === 1}
            onComplete={advance}
          />
          nce Clo
          <AnimatedLetter
            letter="u"
            isActive={activeIndex === 2}
            onComplete={advance}
          />
          d
        </h1>
        <div className="mt-10 flex flex-col items-center gap-5 sm:flex-row pointer-events-auto">
          <Link
            href="/sign-up"
            className="button"
            aria-label="Launch GPU instance"
          >
            LAUNCH GPU INSTANCE
          </Link>
          <Link
            href="/talk-to-our-team"
            className="button button--secondary"
            aria-label="Talk to our team"
          >
            TALK TO OUR TEAM
          </Link>
        </div>
      </div>
    </section>
  );
}
