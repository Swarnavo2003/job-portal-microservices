"use client";
import { auth_service, useAppData } from "@/context/AppContext";
import axios from "axios";
import { redirect } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/loading";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  const { isAuth, setUser, loading, setIsAuth, fetchApplications } =
    useAppData();

  if (loading) return <Loading />;

  if (isAuth) return redirect("/");

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setBtnLoading(true);
    try {
      const { data } = await axios.post(`${auth_service}/api/auth/login`, {
        email,
        password,
      });

      toast.success(data.message);

      Cookies.set("token", data.token, {
        expires: 15,
        secure: true,
        path: "/",
      });

      setUser(data.user);
      setIsAuth(true);
      fetchApplications();
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Something went wrong";
        toast.error(errorMessage);
        setIsAuth(false);
        setUser(null);
      }
    } finally {
      setBtnLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back to HireHeaven
          </h1>
          <p className="text-sm opacity-70">Sign in to continue your journey</p>
        </div>
        <div className="border border-gray-100 rounded-2xl p-8 shadow-lg backdrop-blur-sm">
          <form onSubmit={submitHandler} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute top-2 left-2" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute top-2 left-2" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="*********"
                  className="pl-10 h-10"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                href={"/forgot"}
                className="text-sm text-blue-500 hover:underline transition-all"
              >
                Forgot Password?
              </Link>
            </div>

            <Button disabled={btnLoading} className="w-full">
              {btnLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Signing In
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2" />
                </>
              )}
            </Button>
          </form>
          <div className="mt-6 pt-6 border-t border-gray-400">
            <p className="text-center text-sm">
              Don&apso;t have an account?{" "}
              <Link
                href={"/register"}
                className="text-blue-500 font-medium hover:underline"
              >
                Create a new account?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
