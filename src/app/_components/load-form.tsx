"use client";

import { useEffect, useState } from "react";
import { Select } from "~/app/_components/ui/select";
import { api } from "~/trpc/react";

interface LoadItem {
  clothType: string;
  rate: number;
  count: number;
}

interface LoadFormProps {
  loadId: string | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function LoadForm({ loadId, onSaved, onCancel }: LoadFormProps) {
  const [shopId, setShopId] = useState("");
  const [loadType, setLoadType] = useState<"IRON" | "WASH" | "DRY_CLEAN">(
    "WASH",
  );
  const [pickupDate, setPickupDate] = useState(
    new Date().toISOString().split("T")[0]!,
  );
  const [items, setItems] = useState<LoadItem[]>([
    { clothType: "", rate: 0, count: 0 },
  ]);
  const [error, setError] = useState("");

  const { data: shops } = api.shop.listActive.useQuery();
  const { data: clothTypes } = api.clothType.listActive.useQuery();

  const { data: existingLoad } = api.load.getById.useQuery(
    { id: loadId! },
    { enabled: !!loadId },
  );

  useEffect(() => {
    if (existingLoad) {
      setShopId(existingLoad.shopId);
      setLoadType(existingLoad.loadType);
      setPickupDate(
        new Date(existingLoad.pickupDate).toISOString().split("T")[0]!,
      );
      setItems(
        existingLoad.items.map((item) => ({
          clothType: item.clothType,
          rate: item.rate,
          count: item.count,
        })),
      );
    }
  }, [existingLoad]);

  useEffect(() => {
    if (!loadId && shops && !shopId) {
      const defaultShop = shops.find((s) => s.isDefault);
      if (defaultShop) {
        setShopId(defaultShop.id);
      }
    }
  }, [shops, loadId, shopId]);

  const createMutation = api.load.create.useMutation({
    onSuccess: onSaved,
    onError: (err) => setError(err.message),
  });

  const updateMutation = api.load.update.useMutation({
    onSuccess: onSaved,
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validItems = items.filter(
      (item) => item.clothType && item.rate > 0 && item.count > 0,
    );

    if (validItems.length === 0) {
      setError("Please add at least one valid item");
      return;
    }

    if (!shopId) {
      setError("Please select a shop");
      return;
    }

    const data = {
      shopId,
      loadType,
      pickupDate: new Date(pickupDate),
      items: validItems,
    };

    if (loadId) {
      updateMutation.mutate({ id: loadId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const addItem = () => {
    setItems([...items, { clothType: "", rate: 0, count: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (
    index: number,
    field: keyof LoadItem,
    value: string | number,
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index]!, [field]: value };

    if (field === "clothType" && typeof value === "string" && clothTypes) {
      const selectedType = clothTypes.find((ct) => ct.name === value);
      if (selectedType && newItems[index].rate === 0) {
        const rate =
          loadType === "IRON"
            ? selectedType.ironRate
            : loadType === "WASH"
              ? selectedType.washRate
              : selectedType.dryCleanRate;
        newItems[index] = { ...newItems[index], rate };
      }
    }

    setItems(newItems);
  };

  const totalCost = items.reduce(
    (sum, item) => sum + item.rate * item.count,
    0,
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="mb-6 text-lg font-semibold text-slate-800">
        {loadId ? "Edit Load" : "New Laundry Load"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Shop
            </label>
            <Select
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              className="w-full"
              required
            >
              <option value="">Select a shop</option>
              {shops?.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Pickup Date
            </label>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Load Type
          </label>
          <div className="flex gap-4">
            {(["WASH", "IRON", "DRY_CLEAN"] as const).map((type) => (
              <label
                key={type}
                className="flex cursor-pointer items-center gap-2"
              >
                <input
                  type="radio"
                  name="loadType"
                  value={type}
                  checked={loadType === type}
                  onChange={() => setLoadType(type)}
                  className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">
                  {type === "DRY_CLEAN"
                    ? "Dry Clean"
                    : type.charAt(0) + type.slice(1).toLowerCase()}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Items
          </label>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="rounded-lg bg-slate-50 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Select
                    value={item.clothType}
                    onChange={(e) =>
                      updateItem(index, "clothType", e.target.value)
                    }
                    className="min-w-0 flex-1 rounded px-2 py-1.5 text-sm"
                  >
                    <option value="">Select cloth type</option>
                    {clothTypes?.map((ct) => {
                      const rate =
                        loadType === "IRON"
                          ? ct.ironRate
                          : loadType === "WASH"
                            ? ct.washRate
                            : ct.dryCleanRate;
                      return (
                        <option key={ct.id} value={ct.name}>
                          {ct.name} (₹{rate})
                        </option>
                      );
                    })}
                  </Select>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-slate-500">₹</span>
                    <input
                      type="number"
                      value={item.rate || ""}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "rate",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="Rate"
                      className="w-20 rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-slate-500">×</span>
                    <input
                      type="number"
                      value={item.count || ""}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "count",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      placeholder="Qty"
                      className="w-16 rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                      min="1"
                    />
                  </div>
                  <span className="ml-auto text-sm font-medium text-slate-700">
                    = ₹{(item.rate * item.count).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-3 w-full rounded-lg border border-dashed border-slate-300 py-3 text-sm font-medium text-blue-600 transition hover:border-blue-400 hover:bg-blue-50"
          >
            + Add Item
          </button>
        </div>

        <div className="mb-6 flex justify-end border-t border-slate-200 pt-4">
          <div className="text-lg font-semibold text-slate-800">
            Total: ₹{totalCost.toFixed(2)}
          </div>
        </div>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Saving..." : loadId ? "Update Load" : "Create Load"}
          </button>
        </div>
      </form>
    </div>
  );
}
