import { MdCheck, MdOutlineStars, MdOutlineStorage, MdOutlinePeopleAlt, MdOutlineCloudUpload, MdOutlineFileDownload } from "react-icons/md";
import type { IconType } from "react-icons";
import { parseBytes } from "@/api/endpoints/subscriptions";
import type { SubscriptionPlan } from "@/api/endpoints/subscriptions";
import Button from "@/components/common/Button/Button";
import { formatNaira } from "@/utils/price.utils";

export type BillingCycle = "MONTHLY" | "YEARLY";

const GiB = 1024 ** 3;
const MiB = 1024 ** 2;

const formatStorage = (bytes: number) =>
  bytes >= GiB
    ? `${(bytes / GiB).toFixed(0)} GB`
    : `${(bytes / MiB).toFixed(0)} MB`;

const formatPrice = (kobo: number) => (kobo === 0 ? "Free" : formatNaira(kobo));

interface FeatureRowProps {
  icon: IconType;
  label: string;
  value: string;
  dimmed?: boolean;
}

const FeatureRow = ({ icon: Icon, label, value, dimmed }: FeatureRowProps) => (
  <li className={`flex items-center gap-2 text-xs ${dimmed ? "text-slate-300" : "text-slate-600"}`}>
    <Icon size={14} className={dimmed ? "text-slate-300" : "text-slate-400"} />
    <span>{label}:</span>
    <span className={`font-semibold ml-auto ${dimmed ? "text-slate-300" : "text-slate-700"}`}>
      {value}
    </span>
  </li>
);

export interface PlanCardProps {
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  isCurrent: boolean;
  hasSubscription: boolean;
  onSubscribe: (planId: string, cycle: BillingCycle) => void;
  onTrial: (planId: string) => void;
  isLoading: boolean;
}

const PlanCard = ({
  plan,
  billingCycle,
  isCurrent,
  hasSubscription,
  onSubscribe,
  onTrial,
  isLoading,
}: PlanCardProps) => {
  const totalBytes = parseBytes(plan.max_storage_bytes);
  const monthlyEquiv =
    billingCycle === "YEARLY" ? plan.yearly_price / 12 : plan.monthly_price;
  const displayPrice = formatPrice(monthlyEquiv);
  const canTrial = !hasSubscription && !!plan.trial_days && plan.trial_days > 0;

  const features: FeatureRowProps[] = [
    {
      icon: MdOutlineStorage,
      label: "Storage",
      value: formatStorage(totalBytes),
    },
    {
      icon: MdOutlinePeopleAlt,
      label: "Family Members",
      value:
        !plan.allow_family_connections || plan.max_family_connections === null
          ? "Not included"
          : String(plan.max_family_connections),
      dimmed:
        !plan.allow_family_connections || plan.max_family_connections === null,
    },
    {
      icon: MdOutlineCloudUpload,
      label: "Upload Access",
      value:
        plan.max_upload_members === null
          ? "Not included"
          : String(plan.max_upload_members),
      dimmed: plan.max_upload_members === null,
    },
    {
      icon: MdOutlineFileDownload,
      label: "Download Access",
      value:
        plan.max_download_members === null
          ? "Not included"
          : String(plan.max_download_members),
      dimmed: plan.max_download_members === null,
    },
  ];

  return (
    <div
      className={`bg-white rounded-2xl border p-5 flex flex-col transition-shadow hover:shadow-md ${
        isCurrent ? "border-primary ring-1 ring-primary/20" : "border-slate-100"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <p className="text-sm font-bold text-slate-900">{plan.name}</p>
        {isCurrent && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0 ml-2">
            Current
          </span>
        )}
      </div>

      {/* Price */}
      <div className="mb-4">
        <span className="text-2xl font-extrabold text-slate-900">{displayPrice}</span>
        {monthlyEquiv > 0 && (
          <span className="text-xs text-slate-400 ml-1">/ mo</span>
        )}
        {billingCycle === "YEARLY" && plan.yearly_price > 0 && (
          <p className="text-xs text-slate-400 mt-0.5">
            Billed {formatPrice(plan.yearly_price)} annually
          </p>
        )}
        {canTrial && (
          <p className="text-xs text-green-600 font-semibold mt-1">
            {plan.trial_days}-day free trial available
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="flex flex-col gap-2.5 flex-1 mb-5">
        {features.map((f) => (
          <FeatureRow key={f.label} {...f} />
        ))}
      </ul>

      {/* CTA */}
      {isCurrent ? (
        <div className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary/5 text-primary text-xs font-semibold">
          <MdCheck size={14} />
          Current Plan
        </div>
      ) : canTrial ? (
        <div className="flex flex-col gap-2">
          <Button
            label={`Start ${plan.trial_days}-Day Trial`}
            variant="contained"
            startIcon={<MdOutlineStars size={14} className="text-white" />}
            loading={isLoading}
            onClick={() => onTrial(plan.id)}
          />
          <Button
            label={hasSubscription ? "Switch to This Plan" : "Subscribe"}
            variant="outlined"
            loading={isLoading}
            onClick={() => onSubscribe(plan.id, billingCycle)}
          />
        </div>
      ) : (
        <Button
          label={hasSubscription ? "Switch to This Plan" : "Subscribe"}
          variant="contained"
          loading={isLoading}
          onClick={() => onSubscribe(plan.id, billingCycle)}
        />
      )}
    </div>
  );
};

export default PlanCard;
