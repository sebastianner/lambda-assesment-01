"use client";

import { useState } from "react";
import CardComponent from "@/app/components/CardComponent/CardComponent";
import classNames from "classnames";
import { sectionThreeItems } from "./data";

export default function SectionThree() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleCardClick = (index: number) => {
    setOpenIndex(index);
  };

  return (
    <section
      className={classNames(
        "section-three border-b border-(--color-background-gray)",
        "py-40 px-12",
      )}
    >
      <div className="flex flex-wrap lg:gap-40 justify-between">
        <h2
          className={classNames(
            "section-three-title text-4xl md:text-5xl lg:text-7xl font-bold",
            "max-w-[600px]",
          )}
        >
          The engines of superintelligence
        </h2>
        <p
          className={classNames(
            "section-three-description mt-12 max-w-3xl",
            "font-base text-(--color-text-beige) tracking-widest",
            "lg:max-w-[500px]",
          )}
        >
          Give your team the computational precision to train foundation models
          and serve inference at global scale.
        </p>
      </div>
      <div className={classNames("section-three-cards", "mt-20")}>
        {sectionThreeItems.map((item, index) => (
          <CardComponent
            key={index}
            {...item}
            isOpen={openIndex === index}
            onClick={() => handleCardClick(index)}
          />
        ))}
      </div>
    </section>
  );
}
