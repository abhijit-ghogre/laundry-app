"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "~/app/_components/auth-provider";
import { Dashboard } from "~/app/_components/dashboard";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-lg text-slate-500">Loading...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Dashboard />;
}
