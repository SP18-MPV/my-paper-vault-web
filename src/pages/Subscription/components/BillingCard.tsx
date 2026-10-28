import { MdOutlineCalendarMonth } from "react-icons/md";
import type { MySubscription } from "@/api/endpoints/subscriptions";
import { formatNaira } from "@/utils/price.utils";

const daysUntil = (dateStr: string) =>
  Math.max(
    0,
    Math.ceil(
      (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    ),
  );

const daysBadgeClass = (days: number) => {
  if (days > 30) return "bg-green-100 text-green-700";
  if (days > 10) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-600";
};

interface BillingRowProps {
  label: string;
  children: React.ReactNode;
}

const BillingRow = ({ label, children }: BillingRowProps) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
    <span className="text-xs text-slate-500">{label}</span>
    <span className="text-xs font-semibold text-slate-800">{children}</span>
  </div>
);

interface BillingCardProps {
  subscription: MySubscription;
  canCancel: boolean;
  onCancelClick: () => void;
}

const BillingCard = ({ subscription, canCancel, onCancelClick }: BillingCardProps) => {
  const days = daysUntil(subscription.end_date);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
          <MdOutlineCalendarMonth size={16} className="text-green-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">Next Billing Date</p>
          <p className="text-xs text-slate-400">Your plan will automatically renew</p>
        </div>
      </div>

      <div className="flex-1">
        <BillingRow label="Renewal Date">
          {new Date(subscription.end_date).toLocaleDateString()}
        </BillingRow>
        <BillingRow label="Amount">
          {formatNaira(subscription.price_at_purchase)}
        </BillingRow>
        <BillingRow label="Start Date">
          {new Date(subscription.start_date).toLocaleDateString()}
        </BillingRow>
        <BillingRow label="Days Remaining">
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${daysBadgeClass(days)}`}>
            {days} days
          </span>
        </BillingRow>
        {subscription.grace_period_started_at && (
          <BillingRow label="Grace Period Since">
            {new Date(subscription.grace_period_started_at).toLocaleDateString()}
          </BillingRow>
        )}
      </div>

      {canCancel && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={onCancelClick}
            className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
          >
            Cancel Subscription
          </button>
        </div>
      )}
    </div>
  );
};

export default BillingCard;
