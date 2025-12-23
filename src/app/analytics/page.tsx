"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "~/app/_components/auth-provider";
import { api } from "~/trpc/react";

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data, isLoading } = api.analytics.getExpenditure.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-lg text-slate-500">Loading...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const maxAmount = Math.max(...(data?.chartData.map((d) => d.amount) ?? [1]));

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-slate-800">
            LaundryApp
          </Link>
          <Link
            href="/"
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6">
        <h2 className="mb-6 text-lg font-semibold text-slate-800">
          Expenditure Analytics
        </h2>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-500">This Week</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {formatCurrency(data?.weekly ?? 0)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-500">This Month</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {formatCurrency(data?.monthly ?? 0)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-500">This Year</p>
            <p className="mt-2 text-3xl font-bold text-purple-600">
              {formatCurrency(data?.yearly ?? 0)}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Monthly Breakdown ({new Date().getFullYear()})
          </h3>
          <div className="flex h-64 items-end gap-2">
            {data?.chartData.map((item) => (
              <div
                key={item.month}
                className="flex flex-1 flex-col items-center"
              >
                <div
                  className="w-full rounded-t bg-blue-500 transition-all hover:bg-blue-600"
                  style={{
                    height: `${maxAmount > 0 ? (item.amount / maxAmount) * 200 : 0}px`,
                    minHeight: item.amount > 0 ? "4px" : "0px",
                  }}
                  title={formatCurrency(item.amount)}
                />
                <span className="mt-2 text-xs text-slate-500">
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
