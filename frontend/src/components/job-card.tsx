"use client";

import { Job } from "@/types";
import { Card, CardContent, CardHeader } from "./ui/card";
import { useAppData } from "@/context/AppContext";
import {
  ArrowRight,
  Briefcase,
  Building2,
  DollarSign,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

interface JobCardProps {
  job: Job;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const { user, btnLoading } = useAppData();

  return (
    <Card className="w-full hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-500 group">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 text-sm opacity-70">
              <Building2 size={16} /> <span>{job.company_name}</span>
            </div>
          </div>

          <Link href={`/company/${job.company_id}`} className="shrink-0">
            <div className="w-14 h-14 rounded-xl border-2 overflow-hidden hover:scale-105 transition-transform bg-background">
              <img
                src={job.company_logo}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600">
              <MapPin size={14} />
              <span className="font-medium">{job.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-base font-semibold">
            <DollarSign size={18} className="text-green-600" />
            <span>₹{job.salary} PA</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pt-4 border-t">
        <div className="flex w-full gap-2">
          <Link href={`/jobs/${job.job_id}`} className="flex-1">
            <Button variant={"outline"} className="w-full gap-2 group/btn">
              View Details{" "}
              <ArrowRight
                size={16}
                className="group-hover/btn:translate-x-1 transition-transform"
              />
            </Button>
          </Link>

          {user && user.role === "jobseeker" && (
            <>
              {job.is_active !== false && (
                <Button disabled={btnLoading} className="flex-1 gap-2">
                  <Briefcase size={16} />
                  Easy Apply
                </Button>
              )}
            </>
          )}
        </div>

        {job.is_active === false && (
          <div className="w-full text-center text-sm text-red-600 bg-red-100 dark:bg-red-900/30 rounded-md px-3 py-2 font-medium">
            Position Closed
          </div>
        )}
      </CardContent>
    </Card>
  );
};
