"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function ClothTypeManager() {
  const [newName, setNewName] = useState("");
  const [newIronRate, setNewIronRate] = useState("");
  const [newWashRate, setNewWashRate] = useState("");
  const [newDryCleanRate, setNewDryCleanRate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingIronRate, setEditingIronRate] = useState("");
  const [editingWashRate, setEditingWashRate] = useState("");
  const [editingDryCleanRate, setEditingDryCleanRate] = useState("");

  const { data: clothTypes, refetch } = api.clothType.list.useQuery();

  const createMutation = api.clothType.create.useMutation({
    onSuccess: () => {
      setNewName("");
      setNewIronRate("");
      setNewWashRate("");
      setNewDryCleanRate("");
      void refetch();
    },
  });

  const updateMutation = api.clothType.update.useMutation({
    onSuccess: () => {
      setEditingId(null);
      setEditingName("");
      setEditingIronRate("");
      setEditingWashRate("");
      setEditingDryCleanRate("");
      void refetch();
    },
  });

  const toggleActiveMutation = api.clothType.toggleActive.useMutation({
    onSuccess: () => void refetch(),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const ironRate = parseFloat(newIronRate) || 0;
    const washRate = parseFloat(newWashRate) || 0;
    const dryCleanRate = parseFloat(newDryCleanRate) || 0;
    if (newName.trim()) {
      createMutation.mutate({
        name: newName.trim(),
        ironRate,
        washRate,
        dryCleanRate,
      });
    }
  };

  const handleUpdate = (id: string) => {
    const ironRate = parseFloat(editingIronRate) || 0;
    const washRate = parseFloat(editingWashRate) || 0;
    const dryCleanRate = parseFloat(editingDryCleanRate) || 0;
    if (editingName.trim()) {
      updateMutation.mutate({
        id,
        name: editingName.trim(),
        ironRate,
        washRate,
        dryCleanRate,
      });
    }
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    const message = isActive
      ? "Deactivate this cloth type? It won't appear in selection."
      : "Activate this cloth type?";
    if (confirm(message)) {
      toggleActiveMutation.mutate({ id });
    }
  };

  const startEditing = (
    id: string,
    name: string,
    ironRate: number,
    washRate: number,
    dryCleanRate: number,
  ) => {
    setEditingId(id);
    setEditingName(name);
    setEditingIronRate(ironRate.toString());
    setEditingWashRate(washRate.toString());
    setEditingDryCleanRate(dryCleanRate.toString());
  };

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    toggleActiveMutation.isPending;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">
        Manage Cloth Types
      </h2>

      <form onSubmit={handleCreate} className="mb-4 space-y-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Cloth type name"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500">Iron ₹</span>
            <input
              type="number"
              value={newIronRate}
              onChange={(e) => setNewIronRate(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500">Wash ₹</span>
            <input
              type="number"
              value={newWashRate}
              onChange={(e) => setNewWashRate(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500">Dry ₹</span>
            <input
              type="number"
              value={newDryCleanRate}
              onChange={(e) => setNewDryCleanRate(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isPending || !newName.trim()}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </form>

      {!clothTypes || clothTypes.length === 0 ? (
        <p className="text-sm text-slate-500">
          No cloth types yet. Add your first cloth type above.
        </p>
      ) : (
        <ul className="space-y-2">
          {clothTypes.map((ct) => (
            <li
              key={ct.id}
              className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-3"
            >
              {editingId === ct.id ? (
                <div className="w-full space-y-2">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-500">Iron ₹</span>
                      <input
                        type="number"
                        value={editingIronRate}
                        onChange={(e) => setEditingIronRate(e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-16 rounded border border-slate-300 px-2 py-1 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-500">Wash ₹</span>
                      <input
                        type="number"
                        value={editingWashRate}
                        onChange={(e) => setEditingWashRate(e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-16 rounded border border-slate-300 px-2 py-1 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-500">Dry ₹</span>
                      <input
                        type="number"
                        value={editingDryCleanRate}
                        onChange={(e) => setEditingDryCleanRate(e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-16 rounded border border-slate-300 px-2 py-1 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => handleUpdate(ct.id)}
                      disabled={isPending}
                      className="rounded bg-green-100 px-2 py-1 text-sm font-medium text-green-700 hover:bg-green-200 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded bg-slate-100 px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <span className="text-slate-700">{ct.name}</span>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span>Iron ₹{ct.ironRate}</span>
                      <span>Wash ₹{ct.washRate}</span>
                      <span>Dry ₹{ct.dryCleanRate}</span>
                    </div>
                    {!ct.isActive && (
                      <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                        Inactive
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      startEditing(
                        ct.id,
                        ct.name,
                        ct.ironRate,
                        ct.washRate,
                        ct.dryCleanRate,
                      )
                    }
                    disabled={isPending}
                    className="rounded bg-slate-100 px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(ct.id, ct.isActive)}
                    disabled={isPending}
                    className={`rounded px-2 py-1 text-sm font-medium disabled:opacity-50 ${
                      ct.isActive
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                  >
                    {ct.isActive ? "Deactivate" : "Activate"}
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
