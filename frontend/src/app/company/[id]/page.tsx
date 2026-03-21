"use client";

import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { job_service, useAppData } from "@/context/AppContext";
import { useEffect, useState } from "react";
import { Company, Job } from "@/types";
import axios from "axios";
import { Loading } from "@/components/loading";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function CompanyPage() {
  const { id } = useParams();
  const token = Cookies.get("token");
  const { user, isAuth } = useAppData();
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);

  const [isUpdatedModalOpen, setIsUpdatedModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  async function fetchCompany() {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${job_service}/api/jobs/company/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setCompany(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCompany();
  }, [id]);

  if (loading) return <Loading />;

  const isRecruiterOwner =
    user && company && user.user_id === company.recruiter_id;

  return (
    <div className="min-h-screen bg-secondary/30">
      {company && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card className="overflow-hidden shadow-lg border-2 mb-8">
            <div className="h-32 bg-blue-600"></div>
            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16">
                <div className="w-32 h-32 rounded-2xl border-4 border-background overflow-hidden shadow-xl bg-background shrink-0">
                  <img
                    src={company.logo}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 md:mb-4">
                  <h1 className="text-3xl font-bold mb-2">{company.name}</h1>
                  <p className="text-base leading-relaxed opacity-80 max-w-3xl">
                    {company.description}
                  </p>
                </div>
                <Link
                  href={company.website}
                  target="_blank"
                  className="md:mb-4"
                >
                  <Button className="gap-2">
                    <Globe size={18} />
                    Visit Website
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
