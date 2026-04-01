"use client";

import { redirect, useParams } from "next/navigation";
import Cookies from "js-cookie";
import { job_service, useAppData } from "@/context/AppContext";
import { useEffect, useRef, useState } from "react";
import { Company, Job } from "@/types";
import axios from "axios";
import { Loading } from "@/components/loading";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Building2,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  FileText,
  Globe,
  Laptop,
  MapPin,
  Pencil,
  Plus,
  Users2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CompanyPage() {
  const { id } = useParams();
  const token = Cookies.get("token");
  const { user, isAuth } = useAppData();
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);

  const [isUpdatedModalOpen, setIsUpdatedModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const addModalRef = useRef<HTMLButtonElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState("");
  const [openings, setOpenings] = useState("");
  const [jobType, setJobType] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [isActive, setIsActive] = useState(true);

  const clearInput = () => {
    setTitle("");
    setDescription("");
    setSalary("");
    setLocation("");
    setRole("");
    setJobType("");
    setWorkLocation("");
    setOpenings("");
    setIsActive(true);
  };

  const addJobHandler = async () => {
    setBtnLoading(true);
    try {
      const jobData = {
        title,
        description,
        salary: Number(salary),
        location,
        role,
        job_type: jobType,
        work_location: workLocation,
        company_id: id,
        openings: Number(openings),
      };

      const { data, status } = await axios.post(
        `${job_service}/api/jobs/new`,
        jobData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (status === 201) {
        toast.success(data.message);
        fetchCompany();
        clearInput();
        addModalRef.current?.click();
      }
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Something went wrong";
        toast.error(errorMessage);
      }
    } finally {
      setBtnLoading(false);
    }
  };

  const handleOpenUpdateModal = (job: Job) => {
    setSelectedJob(job);
    setTitle(job.title);
    setDescription(job.description);
    setSalary(String(job.salary || ""));
    setLocation(job.location || "");
    setRole(job.role);
    setJobType(job.job_type || "");
    setWorkLocation(job.work_location);
    setOpenings(String(job.openings || ""));
    setIsActive(job.is_active);
    setIsUpdatedModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsUpdatedModalOpen(false);
    setSelectedJob(null);
    clearInput();
  };

  const updateJobHandler = async () => {
    if (!selectedJob) return;

    setBtnLoading(true);
    try {
      const updatedData = {
        title,
        description,
        salary: Number(salary),
        location,
        role,
        job_type: jobType,
        work_location: workLocation,
        company_id: id,
        openings: Number(openings),
        is_active: isActive,
      };

      const { data, status } = await axios.put(
        `${job_service}/api/jobs/${selectedJob.job_id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (status === 200) {
        toast.success(data.message);
        fetchCompany();
        handleCloseModal();
      }
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Something went wrong";
        toast.error(errorMessage);
      }
    } finally {
      setBtnLoading(false);
    }
  };

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

  if (!isAuth) return redirect("/");

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

          <Dialog>
            {/* Job Section */}
            <Card className="shadow-lg border-2 overflow-hidden">
              <div className="bg-blue-600 border-b p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Briefcase size={20} className="text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      Open Positions
                    </h2>
                  </div>
                  <p className="text-sm opacity-70 text-white font-semibold">
                    {company.jobs?.length || 0} active job
                    {(company.jobs?.length as number) >= 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              {isRecruiterOwner && (
                <>
                  <DialogTrigger asChild>
                    <Button className="gap-2 mx-2">
                      <Plus size={18} /> Post New
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-150 max-h-[900vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl flex items-center gap-2"></DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5 py-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="title"
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <Briefcase size={16} />
                          Job Title
                        </Label>
                        <Input
                          id="title"
                          type="text"
                          placeholder="Enter Job Title"
                          className="h-11"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="description"
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <FileText size={16} />
                          Company Description
                        </Label>
                        <Input
                          id="description"
                          type="text"
                          placeholder="Enter Job Description"
                          className="h-11"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="role"
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <Building2 size={16} />
                          Role/Department
                        </Label>
                        <Input
                          id="role"
                          type="text"
                          placeholder="Enter Job Role"
                          className="h-11"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="salary"
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <DollarSign size={16} />
                          Salary
                        </Label>
                        <Input
                          id="salary"
                          type="number"
                          placeholder="Enter Job Role"
                          className="h-11"
                          value={salary}
                          onChange={(e) => setSalary(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="openings"
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <Users2 size={16} />
                          Openings
                        </Label>
                        <Input
                          id="openings"
                          type="number"
                          placeholder="Enter Job Openings"
                          className="h-11"
                          value={openings}
                          onChange={(e) => setOpenings(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="location"
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <MapPin size={16} />
                          Location
                        </Label>
                        <Input
                          id="location"
                          type="text"
                          placeholder="Enter Location"
                          className="h-11"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="job_type"
                            className="text-sm font-medium flex items-center gap-2"
                          >
                            <Clock size={16} /> Job Type
                          </Label>
                          <Select value={jobType} onValueChange={setJobType}>
                            <SelectTrigger className="h-11 w-full">
                              <SelectValue placeholder="Select Job Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Full-time">
                                Full-time
                              </SelectItem>
                              <SelectItem value="Part-time">
                                Part-time
                              </SelectItem>
                              <SelectItem value="Contract">Contract</SelectItem>
                              <SelectItem value="Internship">
                                Internship
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="work_location"
                            className="text-sm font-medium flex items-center gap-2"
                          >
                            <Laptop size={16} /> Work Location
                          </Label>
                          <Select
                            value={workLocation}
                            onValueChange={setWorkLocation}
                          >
                            <SelectTrigger className="h-11 w-full">
                              <SelectValue placeholder="Select JWork Location" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Onsite">Onsite</SelectItem>
                              <SelectItem value="Remote">Remote</SelectItem>
                              <SelectItem value="Hybrid">Hybrid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button ref={addModalRef} variant={"outline"}>
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        disabled={btnLoading}
                        onClick={addJobHandler}
                        className="gap-2"
                      >
                        {btnLoading ? "Posting Job..." : "Post Job"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </>
              )}

              <div className="p-6">
                {company.jobs && company.jobs?.length > 0 ? (
                  <div className="space-y-4">
                    {company.jobs.map((job) => (
                      <div
                        key={job.job_id}
                        className="p-5 rounded-lg border-2 hover:border-blue-500 transition-all bg-background"
                      >
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              <h3 className="text-xl font-semibold">
                                {job.title}
                              </h3>
                              <span
                                className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${job.is_active ? "bg-green-100 dark:bg-green-900/30 text-green-600" : "bg-gray-100 dark:bg-gray-800 text-gray-600"}`}
                              >
                                {job.is_active ? (
                                  <CheckCircle size={14} />
                                ) : (
                                  <XCircle size={14} />
                                )}
                                {job.is_active ? "Active" : "Inactive"}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
                              <div className="flex items-center gap-2 opacity-70">
                                <Building2 size={16} />
                                <span>{job.role}</span>
                              </div>
                              <div className="flex items-center gap-2 opacity-70">
                                <DollarSign size={16} />
                                <span>
                                  {job.salary
                                    ? `₹ ${job.salary.toLocaleString()}`
                                    : "Not Disclosed"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 opacity-70">
                                <MapPin size={16} />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center gap-2 opacity-70">
                                <Laptop size={16} />
                                <span>
                                  {job.work_location} ({job.job_type})
                                </span>
                              </div>
                              <div className="flex items-center gap-2 opacity-70">
                                <Users2 size={16} />
                                <span>{job.openings} openings</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link href={`/jobs/${job.job_id}`}>
                              <Button
                                variant={"outline"}
                                size={"sm"}
                                className="gap-2"
                              >
                                <Eye size={16} /> View
                              </Button>
                            </Link>

                            {isRecruiterOwner && (
                              <>
                                <Button
                                  onClick={() => handleOpenUpdateModal(job)}
                                  variant={"outline"}
                                  size={"sm"}
                                  className="gap-2"
                                >
                                  <Pencil size={16} /> Edit
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                        <Briefcase size={32} className="opacity-40" />
                      </div>
                      <p className="text-base opacity-70 mb-2">
                        No Jobs Posted Yet
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </Dialog>

          <Dialog
            open={isUpdatedModalOpen}
            onOpenChange={setIsUpdatedModalOpen}
          >
            <DialogContent className="sm:max-w-150 max-h-[900vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  Update Job
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Briefcase size={16} />
                    Job Title
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter Job Title"
                    className="h-11"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <FileText size={16} />
                    Company Description
                  </Label>
                  <Input
                    id="description"
                    type="text"
                    placeholder="Enter Job Description"
                    className="h-11"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="role"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Building2 size={16} />
                    Role/Department
                  </Label>
                  <Input
                    id="role"
                    type="text"
                    placeholder="Enter Job Role"
                    className="h-11"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="salary"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <DollarSign size={16} />
                    Salary
                  </Label>
                  <Input
                    id="salary"
                    type="number"
                    placeholder="Enter Job Role"
                    className="h-11"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="openings"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Users2 size={16} />
                    Openings
                  </Label>
                  <Input
                    id="openings"
                    type="number"
                    placeholder="Enter Job Openings"
                    className="h-11"
                    value={openings}
                    onChange={(e) => setOpenings(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="location"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <MapPin size={16} />
                    Location
                  </Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="Enter Location"
                    className="h-11"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="job_type"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Clock size={16} /> Job Type
                    </Label>
                    <Select value={jobType} onValueChange={setJobType}>
                      <SelectTrigger className="h-11 w-full">
                        <SelectValue placeholder="Select Job Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="work_location"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Laptop size={16} /> Work Location
                    </Label>
                    <Select
                      value={workLocation}
                      onValueChange={setWorkLocation}
                    >
                      <SelectTrigger className="h-11 w-full">
                        <SelectValue placeholder="Select JWork Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Onsite">Onsite</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="isActive"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      {isActive ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        <XCircle size={16} className="text-gray-50" />
                      )}{" "}
                    </Label>
                    <Select
                      value={isActive ? "true" : "false"}
                      onValueChange={(value) => setIsActive(value === "true")}
                    >
                      <SelectTrigger className="h-11 w-full">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button ref={addModalRef} variant={"outline"}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  disabled={btnLoading}
                  onClick={updateJobHandler}
                  className="gap-2"
                >
                  {btnLoading ? "Updating Job..." : "Update Job"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
