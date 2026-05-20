"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import classNames from "classnames";

// Lottie frame segments per accordion index (matches Lambda exactly)
const SEGMENTS = [
  { start: 180, mid: 209, end: 239 },
  { start: 120, mid: 149, end: 179 },
  { start: 60, mid: 89, end: 119 },
  { start: 0, mid: 29, end: 59 },
];

export interface AccordionItem {
  id: string;
  title: string;
  content?: string;
}

interface Props {
  items?: AccordionItem[];
  animationSrc?: string;
}

export default function AccordionLevelAnimation({
  items = [],
  animationSrc = "https://lambda.ai/hubfs/web-static/motion/new_layers-all-steps.json",
}: Props) {
  const [lottie, setLottie] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const prevIndex = useRef(0);
  const isPendingForward = useRef(false);
  const reducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const validItems = useMemo(
    () =>
      items.filter(
        (item) => item && typeof item.id === "string" && item.id.trim() !== "",
      ),
    [items],
  );

  // When lottie loads or activeIndex changes on initial load
  useEffect(() => {
    if (!lottie) return;

    const onLoad = () => {
      const seg = SEGMENTS[activeIndex];
      if (!seg || !lottie.setSegment || !lottie.setFrame) return;
      prevIndex.current = activeIndex;

      if (reducedMotion) {
        lottie.setSegment(seg.start, seg.end);
        lottie.setFrame(seg.mid);
        return;
      }
      lottie.setSpeed?.(2);
      lottie.setSegment(seg.start, seg.mid);
      lottie.setFrame(seg.start);
      lottie.play?.();
    };

    const onComplete = () => {
      if (isPendingForward.current) {
        const seg = SEGMENTS[activeIndex];
        if (seg && lottie.setSegment && lottie.setFrame && lottie.play) {
          lottie.setSegment(seg.start, seg.mid);
          lottie.setFrame(seg.start);
          lottie.play();
          isPendingForward.current = false;
          prevIndex.current = activeIndex;
        }
      }
    };

    lottie.addEventListener?.("load", onLoad);
    lottie.addEventListener?.("complete", onComplete);
    return () => {
      lottie.removeEventListener?.("load", onLoad);
      lottie.removeEventListener?.("complete", onComplete);
    };
  }, [lottie, activeIndex, reducedMotion]);

  // When activeIndex changes after initial load
  useEffect(() => {
    if (!lottie || !lottie.isLoaded || prevIndex.current === activeIndex)
      return;

    const prevSeg = SEGMENTS[prevIndex.current];
    if (!prevSeg || !lottie.setSegment || !lottie.setFrame) return;

    if (reducedMotion) {
      const seg = SEGMENTS[activeIndex];
      if (seg) {
        lottie.setSegment(seg.start, seg.end);
        lottie.setFrame(seg.mid);
        prevIndex.current = activeIndex;
      }
      return;
    }

    // Play exit animation (mid → end), then onComplete will play entry
    isPendingForward.current = true;
    lottie.setSegment(prevSeg.mid, prevSeg.end);
    lottie.setFrame(prevSeg.mid);
    lottie.play?.();
  }, [activeIndex, lottie, reducedMotion]);

  const handleItemChange = (index: number) => {
    if (index >= 0 && index < validItems.length) {
      setActiveIndex(index);
    }
  };

  if (validItems.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row lg:items-start gap-8">
        {/* Accordion */}
        <ul className="w-full lg:w-[55%] lg:shrink-0 list-none p-0 m-0">
          {validItems.map((item, index) => {
            const isOpen = activeIndex === index;
            return (
              <li
                key={item.id}
                className="border-t border-b border-(--color-background-gray) py-8"
              >
                <div className="flex gap-9 items-start">
                  {/* Number */}
                  <div className="text-(--color-beige) min-w-10 text-2xl lg:text-3xl tracking-widest">
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                    <span className="text-(--color-ultraviolet)">/</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => handleItemChange(index)}
                      className="bg-transparent border-none cursor-pointer w-full flex justify-between items-center p-0 text-(--color-beige) text-left"
                    >
                      <h3 className="font-bold text-2xl lg:text-4xl">
                        {item.title}
                      </h3>
                      <span className="text-xl ml-4 text-(--color-beige)">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>

                    <div
                      className={classNames("accordion-content", {
                        "accordion-content--open": isOpen,
                      })}
                    >
                      <div>
                        <div className="pt-4">
                          {item.content && (
                            <p className="font-base text-(--color-text-secondary) tracking-widest">
                              {item.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="w-full lg:flex-1 lg:sticky lg:top-8">
          <div className="relative w-full aspect-square">
            <DotLottieReact
              src={animationSrc}
              loop={false}
              autoplay={false}
              dotLottieRefCallback={setLottie}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
