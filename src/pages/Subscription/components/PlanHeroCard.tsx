import { FaCrown } from "react-icons/fa6";
import {
  MdOutlineStorage,
  MdOutlinePeopleAlt,
  MdOutlineCloudUpload,
  MdOutlineFileDownload,
} from "react-icons/md";
import type { IconType } from "react-icons";
import { parseBytes } from "@/api/endpoints/subscriptions";
import type { MySubscription } from "@/api/endpoints/subscriptions";
import { formatNaira } from "@/utils/price.utils";

const GiB = 1024 ** 3;
const MiB = 1024 ** 2;

const formatStorage = (bytes: number) =>
  bytes >= GiB
    ? `${(bytes / GiB).toFixed(0)} GB`
    : `${(bytes / MiB).toFixed(0)} MB`;

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Currently Active",
  GRACE: "Grace Period",
  RESTRICTED: "Restricted",
  ARCHIVED: "Archived",
  CANCELLED: "Cancelled",
};

interface FeaturePillProps {
  icon: IconType;
  label: string;
  value: string;
}

const FeaturePill = ({ icon: Icon, label, value }: FeaturePillProps) => (
  <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
    <Icon size={13} className="text-white/50 shrink-0" />
    <div className="min-w-0">
      <p className="text-white/50 text-[10px] leading-none mb-0.5">{label}</p>
      <p className="text-white text-xs font-semibold truncate">{value}</p>
    </div>
  </div>
);

interface PlanHeroCardProps {
  subscription: MySubscription;
}

const PlanHeroCard = ({ subscription }: PlanHeroCardProps) => {
  const plan = subscription.subscriptionPlan;
  const totalBytes = parseBytes(plan.max_storage_bytes);
  const isTrial = !!subscription.trial_ends_at;

  const billingLabel =
    subscription.billing_cycle.charAt(0) +
    subscription.billing_cycle.slice(1).toLowerCase();

  const features: FeaturePillProps[] = [
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
    },
    {
      icon: MdOutlineCloudUpload,
      label: "Upload Access",
      value:
        plan.max_upload_members === null
          ? "Not included"
          : String(plan.max_upload_members),
    },
    {
      icon: MdOutlineFileDownload,
      label: "Download Access",
      value:
        plan.max_download_members === null
          ? "Not included"
          : String(plan.max_download_members),
    },
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden bg-linear-to-br from-primary to-indigo-800 p-5 flex flex-col gap-4">
      {/* Decorative circles */}
      <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-8 -right-4 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />

      {/* Plan name + status */}
      <div className="relative flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center shrink-0">
          <FaCrown size={16} className="text-amber-300" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-snug">{plan.name}</p>
          <p className="text-white/60 text-xs">{STATUS_LABEL[subscription.status]}</p>
        </div>
      </div>

      {/* Feature grid */}
      <div className="relative grid grid-cols-2 gap-2">
        {features.map((f) => (
          <FeaturePill key={f.label} {...f} />
        ))}
      </div>

      {/* Price */}
      <div className="relative">
        <div className="flex items-baseline gap-1.5">
          <span className="text-white text-3xl font-extrabold">
            {formatNaira(subscription.price_at_purchase)}
          </span>
          <span className="text-white/60 text-sm">
            /{billingLabel === "Monthly" ? "mo" : "yr"}
          </span>
        </div>
        <p className="text-white/50 text-xs mt-0.5">
          {isTrial
            ? `Trial ends ${new Date(subscription.trial_ends_at!).toLocaleDateString()}`
            : `Billed ${billingLabel.toLowerCase()}`}
        </p>
      </div>
    </div>
  );
};

export default PlanHeroCard;
