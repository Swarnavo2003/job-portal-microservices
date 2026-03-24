"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth_service, useAppData } from "@/context/AppContext";
import axios from "axios";
import Link from "next/link";
import { redirect, useParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const { isAuth } = useAppData();

  if (isAuth) return redirect("/");

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      const { data, status } = await axios.post(
        `${auth_service}/api/auth/reset/${token}`,
        {
          password,
        },
      );

      if (status === 200) {
        toast.success(data.message);
        setPassword("");
        redirect("/login");
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Card className="shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold">
              Reset Password
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Enter new password and confirm
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={submitHandler} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">
                  Passowrd
                </Label>
                <Input
                  id="password"
                  type="text"
                  placeholder="***********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button disabled={btnLoading} className="w-full" size="sm">
                {btnLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </CardContent>

          <CardFooter>
            <p className="text-sm">
              Go back to{" "}
              <Link href="/" className="text-blue-500 hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
