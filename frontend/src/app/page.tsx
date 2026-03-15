"use client";
import { CareerGuide } from "@/components/career-guide";
import { Hero } from "@/components/hero";
import { Loading } from "@/components/loading";
import { ResumeAnalyzer } from "@/components/resume-analyser";
import { useAppData } from "@/context/AppContext";

export default function Home() {
  const { loading } = useAppData();

  if (loading) return <Loading />;
  return (
    <div className="p-2 space-y-2">
      <Hero />
      <CareerGuide />
      <ResumeAnalyzer />
    </div>
  );
}
