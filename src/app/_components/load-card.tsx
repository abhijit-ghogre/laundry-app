"use client";

import Link from "next/link";
import { api } from "~/trpc/react";

interface LoadItem {
  id: string;
  clothType: string;
  rate: number;
  count: number;
}

interface Shop {
  id: string;
  name: string;
}

interface Load {
  id: string;
  shopId: string;
  shop: Shop;
  pickupDate: Date;
  isDelivered: boolean;
  deliveredAt: Date | null;
  createdAt: Date;
  items: LoadItem[];
}

interface LoadCardProps {
  load: Load;
  editHref: string;
  onUpdate: () => void;
}

export function LoadCard({ load, editHref, onUpdate }: LoadCardProps) {
  const markDeliveredMutation = api.load.markDelivered.useMutation({
    onSuccess: onUpdate,
  });

  const unmarkDeliveredMutation = api.load.unmarkDelivered.useMutation({
    onSuccess: onUpdate,
  });

  const deleteMutation = api.load.delete.useMutation({
    onSuccess: onUpdate,
  });

  const totalCost = load.items.reduce(
    (sum, item) => sum + item.rate * item.count,
    0,
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleToggleDelivered = () => {
    if (load.isDelivered) {
      unmarkDeliveredMutation.mutate({ id: load.id });
    } else {
      markDeliveredMutation.mutate({ id: load.id });
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this load?")) {
      deleteMutation.mutate({ id: load.id });
    }
  };

  const isPending =
    markDeliveredMutation.isPending ||
    unmarkDeliveredMutation.isPending ||
    deleteMutation.isPending;

  return (
    <div
      className={`rounded-xl border bg-white p-4 transition ${
        load.isDelivered
          ? "border-green-200 bg-green-50/50"
          : "border-slate-200"
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">{load.shop.name}</h3>
          <p className="text-sm text-slate-500">
            Pickup: {formatDate(load.pickupDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {load.isDelivered ? (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              Delivered
            </span>
          ) : (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
              Pending
            </span>
          )}
        </div>
      </div>

      <div className="mb-3 space-y-1">
        {load.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-slate-600">
              {item.clothType} × {item.count}
            </span>
            <span className="text-slate-700">
              ₹{item.rate} × {item.count} = ₹
              {(item.rate * item.count).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="mb-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="font-medium text-slate-700">Total</span>
        <span className="text-lg font-semibold text-slate-800">
          ₹{totalCost.toFixed(2)}
        </span>
      </div>

      {load.isDelivered && load.deliveredAt && (
        <p className="mb-3 text-xs text-slate-500">
          Delivered on: {formatDateTime(load.deliveredAt)}
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleToggleDelivered}
          disabled={isPending}
          className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
            load.isDelivered
              ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          {load.isDelivered ? "Unmark Delivered" : "Mark Delivered"}
        </button>
        <Link
          href={editHref}
          className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
        >
          Edit
        </Link>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
