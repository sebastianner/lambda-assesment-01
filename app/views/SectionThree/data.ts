export interface SectionThreeItem {
  image: string;
  brand: string;
  model: string;
  description: string;
}

export const sectionThreeItems: SectionThreeItem[] = [
  {
    image: "/img/img2.jpg",
    brand: "NVIDIA",
    model: "VR200 NVL72",
    description: "Rack-scale systems optimized for agentic AI.",
  },
  {
    image: "/img/gb300.png",
    brand: "NVIDIA",
    model: "GB300 NVL72",
    description: "Rack-scale systems optimized for AI reasoning",
  },
  {
    image: "/img/img1.webp",
    brand: "NVIDIA",
    model: "HGX B300",
    description: "Peak performance per watt for the largest training runs",
  },
  {
    image: "/img/img5.png",
    brand: "NVIDIA",
    model: "HGX B200",
    description: "Versatile fine-tuning and inference",
  },
];
