"use client";

import { Job } from "@/types";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { job_service } from "@/context/AppContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Briefcase, Filter } from "lucide-react";
import { Loading } from "@/components/loading";
import { Card } from "@/components/ui/card";
import { JobCard } from "@/components/job-card";

const location: string[] = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Pune",
  "Remote",
];

export default function JobsPage() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");

  const token = Cookies.get("token");
  const ref = useRef<HTMLButtonElement>(null);

  async function fetchJobs() {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${job_service}/api/jobs/all?title=${title}&location=${location}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setJobs(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Something went wrong";
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Explore <span className="text-red-500">Oppurtunities</span>
              </h1>
              <p className="text-base opacity-70">{jobs?.length} jobs</p>
            </div>

            <Button className="gap-2 h-11">
              <Filter size={18} /> Filters
            </Button>
          </div>

          {loading ? (
            <Loading />
          ) : (
            <>
              {jobs && jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 w-full">
                  {jobs.map((job) => (
                    <JobCard key={job.job_id} job={job} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <Briefcase size={40} className="opacity-40" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Jobs Found</h3>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
