import AccordionLevelAnimation from "@/app/components/AccordionLevelAnimation/AccordionLevelAnimation";
import classNames from "classnames";

export default function SectionTwo() {
  return (
    <section
      className={classNames(
        "section-two",
        "py-40 px-12 lg:px-12",
        "border-b border-(--color-background-gray)",
      )}
    >
      <h2 className="section-two-title text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold">
        Built for AI. Ready for superintelligence.
      </h2>
      <div className="w-full h-full mt-20">
        <AccordionLevelAnimation
          items={[
            {
              id: "compute",
              title: "You bring models. We bring the compute.",
              content:
                "Get complete AI factories integrating high-density power, liquid cooling, and NVIDIA GPUs into one system designed for peak AI performance.",
            },
            {
              id: "supercomputer",
              title: "Your supercomputer. Your rules.",
              content:
                "Accelerate every stage of your AI lifecycle. Train foundation models and serve billions of tokens.",
            },
            {
              id: "orchestration",
              title: "Orchestration, handled.",
              content:
                "Run large-scale AI workloads without the operational burden. We manage your clusters so you can focus on innovation.",
            },
            {
              id: "enterprise",
              title: "Enterprise-ready from day one.",
              content:
                "Co-engineer your workloads with the very people building the infrastructure behind the world’s most advanced models.",
            },
          ]}
        />
      </div>
    </section>
  );
}
