"use client";

import { Loading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { job_service, useAppData } from "@/context/AppContext";
import { Application, Job } from "@/types";
import axios from "axios";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  MapPin,
  User,
  Users,
  Layers,
  FileText,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Label } from "@/components/ui/label";
import Link from "next/link";

function ApplicationCard({
  item,
  onUpdate,
  btnLoading,
}: {
  item: Application;
  onUpdate: (applicationId: number, status: string) => Promise<void>;
  btnLoading: boolean;
}) {
  const [value, setValue] = useState("");
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!value) return toast.error("Please select a status first");
    setUpdating(true);
    await onUpdate(item.application_id, value);
    setUpdating(false);
  };

  const statusStyles: Record<string, string> = {
    Hired:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
    Rejected:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800",
    Submitted:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
  };

  return (
    <div className="group p-5 rounded-xl border-2 border-border bg-background hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {item.applicant_email?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="font-semibold text-sm">
              {item.applicant_email ?? "Applicant"}
            </p>
            <p className="text-xs text-muted-foreground">
              {item.applicant_email}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[item.status] ?? statusStyles["Submitted"]}`}
        >
          {item.status}
        </span>
      </div>

      {/* Links */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
        <Link
          target="_blank"
          href={item.resume}
          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          <FileText size={13} />
          View Resume
          <ExternalLink size={11} />
        </Link>
        <span className="text-border">|</span>
        <Link
          target="_blank"
          href={`/account/${item.applicant_id}`}
          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          <User size={13} />
          View Profile
          <ExternalLink size={11} />
        </Link>
      </div>

      {/* Update status row */}
      <div className="flex gap-2">
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 text-sm p-2 border-2 border-border rounded-lg bg-background focus:outline-none focus:border-blue-500 transition-colors"
        >
          <option value="">Change status…</option>
          <option value="Submitted">Submitted</option>
          <option value="Hired">Hired</option>
          <option value="Rejected">Rejected</option>
        </select>
        <Button
          size="sm"
          disabled={btnLoading || updating || !value}
          onClick={handleUpdate}
          className="shrink-0 px-4"
        >
          {updating ? "Saving…" : "Update"}
        </Button>
      </div>
    </div>
  );
}

export default function JobPage() {
  const { id } = useParams();
  const { user, applyJob, applications, btnLoading } = useAppData();
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [jobApplications, setJobApplications] = useState<Application[]>([]);
  const [filterStatus, setFilterStatus] = useState("All");

  const token = Cookies.get("token");

  // Check if user already applied
  useEffect(() => {
    if (applications && id) {
      const alreadyApplied = applications.some(
        (item: Application) => item.job_id === Number(id),
      );
      setApplied(alreadyApplied);
    }
  }, [applications, id]);

  // Fetch job details
  async function fetchSingleJob() {
    try {
      const { data } = await axios.get(`${job_service}/api/jobs/${id}`);
      setJob(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSingleJob();
  }, [id]);

  // Fetch applications (recruiter only)
  async function fetchJobApplications() {
    try {
      const { data } = await axios.get(
        `${job_service}/api/jobs/application/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setJobApplications(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Something went wrong");
      }
    }
  }

  useEffect(() => {
    if (user && job && user.user_id === job.posted_by_recruiter_id) {
      fetchJobApplications();
    }
  }, [user, job]);

  // ✅ BUG FIX: uses application_id (not applicant_id), and receives status from child
  const updateApplicationHandler = async (
    applicationId: number,
    status: string,
  ) => {
    try {
      const { data } = await axios.put(
        `${job_service}/api/jobs/application/update/${applicationId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(data.message);
      fetchJobApplications();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Something went wrong");
      }
    }
  };

  const filteredApplications =
    filterStatus === "All"
      ? jobApplications
      : jobApplications.filter((item) => item.status === filterStatus);

  const isRecruiterOwner =
    user && job && Number(user.user_id) === Number(job.posted_by_recruiter_id);

  // ─── Render ──────────────────────────────────────────────────────────────
  if (loading) return <Loading />;

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-lg">Job not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 pb-16">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 gap-2 -ml-2"
        >
          <ArrowLeft size={18} />
          Back To Jobs
        </Button>

        {/* ── Job Card ── */}
        <Card className="overflow-hidden shadow-lg border-2 mb-8">
          {/* Hero banner */}
          <div className="bg-linear-to-r from-blue-600 to-blue-800 p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      job.is_active
                        ? "bg-emerald-400/20 text-emerald-200 border border-emerald-400/40"
                        : "bg-red-400/20 text-red-200 border border-red-400/40"
                    }`}
                  >
                    {job.is_active ? "● Hiring" : "● Closed"}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">
                    {job.job_type}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">
                    {job.work_location}
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  {job.title}
                </h1>

                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <Building2 size={15} />
                  <span>{job.role}</span>
                </div>
              </div>

              {/* Apply / Applied */}
              {user?.role === "jobseeker" && (
                <div className="shrink-0 mt-1">
                  {applied ? (
                    <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-sm font-medium">
                      <CheckCircle2 size={16} />
                      Already Applied
                    </div>
                  ) : (
                    job.is_active && (
                      <Button
                        onClick={() => applyJob(job.job_id)}
                        disabled={btnLoading}
                        className="gap-2 h-11 px-7 bg-white text-blue-700 hover:bg-blue-50 font-semibold"
                      >
                        <Briefcase size={16} />
                        {btnLoading ? "Applying…" : "Apply Now"}
                      </Button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Details grid */}
          <div className="p-8">
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: MapPin, label: "Location", value: job.location },
                {
                  icon: DollarSign,
                  label: "Salary",
                  value: `₹ ${Number(job.salary).toLocaleString("en-IN")} / yr`,
                },
                {
                  icon: Users,
                  label: "Openings",
                  value: `${job.openings} positions`,
                },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 p-4 rounded-xl border-2 bg-secondary/40 hover:bg-secondary/70 transition-colors"
                >
                  <div className="h-11 w-11 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Icon size={19} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">
                      {label}
                    </p>
                    <p className="font-semibold text-sm">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Layers size={20} className="text-blue-600" />
                Job Description
              </h2>
              <div className="p-6 rounded-xl bg-secondary/40 border-2">
                <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/80">
                  {job.description}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Applications Panel (recruiter only) ── */}
        {isRecruiterOwner && (
          <div>
            {/* Panel header */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-bold">Applications</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {jobApplications.length} total · {filteredApplications.length}{" "}
                  shown
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Label
                  htmlFor="filter-status"
                  className="text-sm font-medium whitespace-nowrap"
                >
                  Filter by:
                </Label>
                <select
                  id="filter-status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-sm p-2 px-3 border-2 border-border rounded-lg bg-background focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="All">All</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {jobApplications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 rounded-xl border-2 border-dashed border-border text-center">
                <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-3">
                  <Briefcase size={24} className="text-muted-foreground" />
                </div>
                <p className="font-semibold text-muted-foreground">
                  No applications yet
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Applications will appear here once candidates apply
                </p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No applications with status <strong>{filterStatus}</strong>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {filteredApplications.map((item: Application) => (
                  <ApplicationCard
                    key={item.application_id}
                    item={item}
                    onUpdate={updateApplicationHandler}
                    btnLoading={btnLoading}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
