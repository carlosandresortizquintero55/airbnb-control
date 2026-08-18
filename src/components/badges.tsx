import type { ItemCondition } from "@/lib/types/database";

const CONDITION_STYLES: Record<ItemCondition, string> = {
  bueno: "bg-emerald-50 text-emerald-700",
  regular: "bg-amber-50 text-amber-700",
  malo: "bg-red-50 text-red-700",
};

const CONDITION_LABELS: Record<ItemCondition, string> = {
  bueno: "Bueno",
  regular: "Regular",
  malo: "Malo",
};

export function ConditionBadge({ condition }: { condition: ItemCondition }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${CONDITION_STYLES[condition]}`}
    >
      {CONDITION_LABELS[condition]}
    </span>
  );
}

export function StockBadge({
  current,
  min,
}: {
  current: number;
  min: number;
}) {
  const low = current <= min;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
        low ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"
      }`}
    >
      {low ? "Stock bajo" : "OK"}
    </span>
  );
}
