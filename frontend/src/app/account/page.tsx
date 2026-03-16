"use client";

import { Loading } from "@/components/loading";
import { useAppData } from "@/context/AppContext";
import { Info } from "./_components/info";

export default function AccountPage() {
  const { user, loading } = useAppData();

  if (loading || !user) return <Loading />;

  return (
    <>
      {user && (
        <div className="w-[90%] md:w-[60%] m-auto">
          <Info user={user} isYourAccount={true} />
        </div>
      )}
    </>
  );
}
