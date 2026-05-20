import AccordionLevelAnimation from "./components/AccordionLevelAnimation/AccordionLevelAnimation";
import CardComponent from "./components/CardComponent/CardComponent";
import Hero from "./components/Hero/Hero";
import SectionThree from "./views/SectionThree/SectionThree";
import SectionTwo from "./views/SectionTwo/SectionTwo";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
      </main>
      <SectionTwo />
      <SectionThree />
    </>
  );
}
