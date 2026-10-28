import { useNavigate } from "react-router-dom";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { parseBytes } from "@/api/endpoints/subscriptions";
import { formatNaira } from "@/utils/price.utils";

const GiB = 1024 ** 3;
const MiB = 1024 ** 2;
const KiB = 1024;

const formatBytes = (bytes: number): string => {
  if (bytes >= GiB) return `${(bytes / GiB).toFixed(1)} GB`;
  if (bytes >= MiB) return `${(bytes / MiB).toFixed(0)} MB`;
  return `${(bytes / KiB).toFixed(0)} KB`;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Currently Active",
  GRACE: "Grace Period",
  RESTRICTED: "Restricted",
  CANCELLED: "Cancelled",
  ARCHIVED: "Archived",
};

const THRESHOLD_BAR: Record<string, string> = {
  OK: "bg-amber-400",
  WARNING_80: "bg-amber-500",
  WARNING_95: "bg-orange-500",
  BLOCKED: "bg-red-500",
};

const PlanCard = () => {
  const navigate = useNavigate();
  const subscription = useSubscriptionStore((s) => s.subscription);
  const storage = useSubscriptionStore((s) => s.storage);
  const isLoaded = useSubscriptionStore((s) => s.isLoaded);

  if (!isLoaded) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 animate-pulse">
        <div className="h-3.5 w-44 bg-amber-100 rounded mb-3" />
        <div className="flex justify-between mb-1.5">
          <div className="h-3 w-28 bg-amber-100 rounded" />
          <div className="h-3 w-8 bg-amber-100 rounded" />
        </div>
        <div className="h-1.5 w-full bg-amber-100 rounded-full mb-2" />
        <div className="h-3 w-40 bg-amber-100 rounded" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <button
        type="button"
        onClick={() => navigate("/subscription")}
        className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left hover:border-amber-300 transition-colors cursor-pointer"
      >
        <p className="text-xs font-semibold text-amber-800 mb-1">
          No active subscription
        </p>
        <p className="text-xs text-amber-700 underline">View plans →</p>
      </button>
    );
  }

  const plan = subscription.subscriptionPlan;
  const isTrial = !!subscription.trial_ends_at;
  const statusLabel = isTrial
    ? "Trial Active"
    : (STATUS_LABEL[subscription.status] ?? subscription.status);

  const renewsLabel = isTrial
    ? `Trial ends ${formatDate(subscription.trial_ends_at!)}`
    : `Renews ${formatDate(subscription.end_date)}`;

  const priceLabel =
    subscription.price_at_purchase > 0
      ? ` · ${formatNaira(subscription.price_at_purchase)}`
      : "";

  const usedPercent = storage?.used_percent ?? 0;
  const threshold = storage?.threshold ?? "OK";
  const usedBytesNum = storage ? parseBytes(storage.used_bytes) : 0;
  const totalBytesNum = parseBytes(plan.max_storage_bytes);
  const barColor = THRESHOLD_BAR[threshold] ?? "bg-amber-400";

  return (
    <button
      type="button"
      onClick={() => navigate("/subscription")}
      className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left hover:border-amber-300 transition-colors cursor-pointer"
    >
      <p className="text-xs font-semibold text-amber-800 mb-2">
        👑 {plan.name} — {statusLabel}
      </p>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-slate-500">
          {formatBytes(usedBytesNum)} of {formatBytes(totalBytesNum)} used
        </span>
        <span className="text-xs font-bold text-amber-600">{usedPercent}%</span>
      </div>
      <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all`}
          style={{ width: `${usedPercent}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 mt-2">
        {renewsLabel}
        {priceLabel}
      </p>
    </button>
  );
};

export default PlanCard;
