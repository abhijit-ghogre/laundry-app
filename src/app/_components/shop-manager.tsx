"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function ShopManager() {
  const [newShopName, setNewShopName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const { data: shops, refetch } = api.shop.list.useQuery();

  const createMutation = api.shop.create.useMutation({
    onSuccess: () => {
      setNewShopName("");
      void refetch();
    },
  });

  const updateMutation = api.shop.update.useMutation({
    onSuccess: () => {
      setEditingId(null);
      setEditingName("");
      void refetch();
    },
  });

  const toggleActiveMutation = api.shop.toggleActive.useMutation({
    onSuccess: () => void refetch(),
  });

  const setDefaultMutation = api.shop.setDefault.useMutation({
    onSuccess: () => void refetch(),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newShopName.trim()) {
      createMutation.mutate({ name: newShopName.trim() });
    }
  };

  const handleUpdate = (id: string) => {
    if (editingName.trim()) {
      updateMutation.mutate({ id, name: editingName.trim() });
    }
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    const message = isActive
      ? "Deactivate this shop? It won't appear in shop selection."
      : "Activate this shop?";
    if (confirm(message)) {
      toggleActiveMutation.mutate({ id });
    }
  };

  const startEditing = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    toggleActiveMutation.isPending ||
    setDefaultMutation.isPending;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">
        Manage Shops
      </h2>

      <form onSubmit={handleCreate} className="mb-4 flex gap-2">
        <input
          type="text"
          value={newShopName}
          onChange={(e) => setNewShopName(e.target.value)}
          placeholder="New shop name"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending || !newShopName.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {!shops || shops.length === 0 ? (
        <p className="text-sm text-slate-500">
          No shops yet. Add your first shop above.
        </p>
      ) : (
        <ul className="space-y-2">
          {shops.map((shop) => (
            <li
              key={shop.id}
              className="flex items-center gap-2 rounded-lg bg-slate-50 p-3"
            >
              {editingId === shop.id ? (
                <>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleUpdate(shop.id)}
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
                </>
              ) : (
                <>
                  <span className="flex-1 text-slate-700">
                    {shop.name}
                    {shop.isDefault && (
                      <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                        Default
                      </span>
                    )}
                    {!shop.isActive && (
                      <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                        Inactive
                      </span>
                    )}
                  </span>
                  {!shop.isDefault && (
                    <button
                      onClick={() => setDefaultMutation.mutate({ id: shop.id })}
                      disabled={isPending}
                      className="rounded bg-blue-50 px-2 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => startEditing(shop.id, shop.name)}
                    disabled={isPending}
                    className="rounded bg-slate-100 px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(shop.id, shop.isActive)}
                    disabled={isPending}
                    className={`rounded px-2 py-1 text-sm font-medium disabled:opacity-50 ${
                      shop.isActive
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                  >
                    {shop.isActive ? "Deactivate" : "Activate"}
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
