import { Hero } from "@/components/sections/hero";
import { MyWorks } from "@/components/sections/my-works";
import { Versatility } from "@/components/sections/versatility";
import { DevWorks } from "@/components/sections/dev-works";
import { ThreeDWorks } from "@/components/sections/three-d-works";
import { TechStack } from "@/components/sections/tech-stack";
import { Story } from "@/components/sections/story";
import { Insights } from "@/components/sections/insights";
import { Partnership } from "@/components/sections/partnership";
import { Collaborations } from "@/components/sections/collaborations";

// Home sections in page order (SPEC.md §3). The footer (#contact) comes from the root layout.
export default function Home() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <Hero />
      <MyWorks />
      <Versatility />
      <DevWorks />
      <ThreeDWorks />
      <TechStack />
      <Story />
      <Insights />
      <Partnership />
      <Collaborations />
    </main>
  );
}
