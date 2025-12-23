"use client";

import Link from "next/link";
import { useAuth } from "~/app/_components/auth-provider";
import { LoadCard } from "~/app/_components/load-card";
import { api } from "~/trpc/react";

export function Dashboard() {
  const { email, logout } = useAuth();

  const { data: loads, refetch } = api.load.list.useQuery();

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-slate-800">LaundryApp</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{email}</span>
            <button
              onClick={logout}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            Your Laundry Loads
          </h2>
          <div className="flex gap-2">
            <Link
              href="/shops"
              className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Manage Shops
            </Link>
            <Link
              href="/loads/new"
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
            >
              + New Load
            </Link>
          </div>
        </div>

        {!loads || loads.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">No laundry loads yet.</p>
            <p className="mt-1 text-sm text-slate-400">
              Create your first load to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {loads.map((load) => (
              <LoadCard
                key={load.id}
                load={load}
                editHref={`/loads/${load.id}/edit`}
                onUpdate={() => void refetch()}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
