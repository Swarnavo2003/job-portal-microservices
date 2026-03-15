"use client";

import { auth_service, useAppData } from "@/context/AppContext";
import axios from "axios";
import { redirect } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Label } from "@/components/ui/label";
import { ArrowRight, Briefcase, Loader2, Lock, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/loading";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  const { isAuth, setUser, loading, setIsAuth } = useAppData();

  if (loading) return <Loading />;

  if (isAuth) return redirect("/");

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setBtnLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("role", role);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("phoneNumber", phoneNumber);

    if (role === "jobseeker") {
      formData.append("bio", bio);
      if (resume) {
        formData.append("file", resume);
      }
    }

    try {
      const { data } = await axios.post(
        `${auth_service}/api/auth/register`,
        formData,
      );

      toast.success(data.message);

      Cookies.set("token", data.token, {
        expires: 15,
        secure: true,
        path: "/",
      });

      setUser(data.user);
      setIsAuth(true);
    } catch (error: any) {
      toast.error(error.response.data.message);
      setIsAuth(true);
    } finally {
      setBtnLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Join HireHeaven</h1>
          <p className="text-sm opacity-70">
            Create a new accout and embark on a your job hunting journey
          </p>
        </div>
        <div className="border border-gray-100 rounded-2xl p-8 shadow-lg backdrop-blur-sm">
          <form onSubmit={submitHandler} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm">
                I want to
              </Label>
              <div className="relative">
                <Briefcase className="absolute top-2 left-2" />
                <select
                  id="role"
                  value={role}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setRole(e.target.value)
                  }
                  className="w-full h-11 pl-10 pr-5 border-2 border-gray-300 rounded-md bg-transparent"
                  required
                >
                  <option value="">Select your Role</option>
                  <option value="jobseeker">Find a Job</option>
                  <option value="recruiter">Hire Talent</option>
                </select>
              </div>
            </div>

            {role && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">
                    Name
                  </Label>
                  <div className="relative">
                    <Mail className="absolute top-2 left-2" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jon Doe"
                      className="pl-10 h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute top-2 left-2" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="pl-10 h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute top-2 left-2" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="*********"
                      className="pl-10 h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Lock className="absolute top-2 left-2" />
                    <Input
                      id="phone"
                      type="number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="9876543210"
                      className="pl-10 h-10"
                    />
                  </div>
                </div>

                {role === "jobseeker" && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="resume" className="text-sm">
                        Resume (PDF)
                      </Label>
                      <div className="relative">
                        <Lock className="absolute top-2 left-2" />
                        <Input
                          id="resume"
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setResume(e.target.files[0]);
                            }
                          }}
                          className="h-10 pl-10 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-sm">
                        Bio
                      </Label>
                      <div className="relative">
                        <Lock className="absolute top-2 left-2" />
                        <Input
                          id="bio"
                          type="text"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell us about yourself"
                          className="pl-10 h-10"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Button disabled={btnLoading} className="w-full">
                  {btnLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" />
                      Please Wait
                    </>
                  ) : (
                    <>
                      Register
                      <ArrowRight className="ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
          <div className="mt-6 pt-6 border-t border-gray-400">
            <p className="text-center text-sm">
              Already have an account?{" "}
              <Link
                href={"/login"}
                className="text-blue-500 font-medium hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
