"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "~/app/_components/auth-provider";
import { ShopManager } from "~/app/_components/shop-manager";

export default function ShopsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-500">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-slate-800">LaundryApp</h1>
          <button
            onClick={() => router.push("/")}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Loads
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6">
        <ShopManager />
      </div>
    </main>
  );
}
