"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "normal" | "highlighted" | "font-only";

const DURATIONS: Record<Exclude<Phase, "normal">, number> = {
  highlighted: 2000,
  "font-only": 2000,
};

const NEXT: Record<Exclude<Phase, "normal">, Phase> = {
  highlighted: "font-only",
  "font-only": "normal",
};

interface Props {
  letter: string;
  isActive: boolean;
  onComplete: () => void;
}

export default function AnimatedLetter({
  letter,
  isActive,
  onComplete,
}: Props) {
  const [phase, setPhase] = useState<Phase>("normal");
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setPhase(isActive ? "highlighted" : "normal");
  }, [isActive]);

  useEffect(() => {
    if (phase === "normal") return;
    const next = NEXT[phase];
    const t = setTimeout(() => {
      setPhase(next);
      if (next === "normal") onCompleteRef.current();
    }, DURATIONS[phase]);
    return () => clearTimeout(t);
  }, [phase]);

  const pixelated = phase !== "normal";
  const bg = phase === "highlighted";

  return (
    <span
      style={{
        fontFamily: pixelated ? "var(--font-pixelify)" : "inherit",
        backgroundColor: bg ? "#ffffff" : "transparent",
        color: bg ? "#0b0b0b" : "inherit",
        padding: bg ? "0 3px" : undefined,
        transition: "background-color 0.2s ease, color 0.2s ease",
        display: "inline",
        textShadow: pixelated ? "var(--text-shadow)" : undefined,
      }}
    >
      {letter}
    </span>
  );
}
