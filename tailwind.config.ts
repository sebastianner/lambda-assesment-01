import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        suisse: ["var(--font-suisse)", "Helvetica, Arial, sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
};

export default config;
