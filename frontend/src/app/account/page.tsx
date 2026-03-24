"use client";

import { Loading } from "@/components/loading";
import { useAppData } from "@/context/AppContext";
import { Info } from "./_components/info";
import { Skills } from "./_components/skills";
import { Company } from "./_components/company";
import { redirect } from "next/navigation";

export default function AccountPage() {
  const { user, loading, isAuth } = useAppData();

  if (!isAuth) return redirect("/login");

  if (loading || !user) return <Loading />;

  return (
    <>
      {user && (
        <div className="w-[90%] md:w-[60%] m-auto">
          <Info user={user} isYourAccount={true} />
          {user.role === "jobseeker" && (
            <Skills user={user} isYourAccount={true} />
          )}
          {user.role === "recruiter" && <Company />}
        </div>
      )}
    </>
  );
}
