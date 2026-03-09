import { CareerGuide } from "@/components/career-guide";
import { Hero } from "@/components/hero";
import { ResumeAnalyzer } from "@/components/resume-analyser";

export default function Home() {
  return (
    <div className="p-2 space-y-2">
      <Hero />
      <CareerGuide />
      <ResumeAnalyzer />
    </div>
  );
}
