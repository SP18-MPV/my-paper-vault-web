import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import {
  useSubscriptionPlans,
  useSubscribeToPlan,
  useStartTrial,
} from "@/hooks/useSubscriptionPlans";
import { useInitializePayment } from "@/hooks/usePayments";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { handleApiError } from "@/errors/errorHandler";
import { toast } from "@/lib/toast";
import PlanCard from "./components/PlanCard";
import PlanCardSkeleton from "./components/PlanCardSkeleton";
import BillingCycleToggle from "./components/BillingCycleToggle";
import type { BillingCycle } from "./components/PlanCard";

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("MONTHLY");
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const { data: plans, isLoading } = useSubscriptionPlans();
  const subscription = useSubscriptionStore((s) => s.subscription);
  const currentPlanId = subscription?.subscription_plan_id ?? null;

  const { mutate: subscribe } = useSubscribeToPlan();
  const { mutate: trial } = useStartTrial();
  const { mutate: startCheckout } = useInitializePayment();

  const activePlans = (plans ?? []).filter((p) => p.is_active);

  const handleSubscribe = (planId: string, cycle: BillingCycle) => {
    setLoadingPlanId(planId);

    const plan = activePlans.find((p) => p.id === planId);
    const price = cycle === "YEARLY" ? plan?.yearly_price : plan?.monthly_price;

    // Paid plans are activated only by a verified payment: send the user to
    // Flutterwave's checkout, which returns them to /payments/callback.
    if (price && price > 0) {
      startCheckout(
        { planId, billingCycle: cycle },
        {
          onSuccess: (res) => {
            if (!res.success) {
              toast.error("Couldn't start the payment", "Please try again.");
              setLoadingPlanId(null);
              return;
            }
            window.location.assign(res.data.payment_url);
          },
          onError: () => setLoadingPlanId(null),
        },
      );
      return;
    }

    subscribe(
      { planId, billingCycle: cycle },
      {
        onSuccess: () => {
          toast.success("Subscription activated", "Your new plan is now active.");
          navigate("/subscription");
        },
        onError: (err) => {
          handleApiError(err);
          setLoadingPlanId(null);
        },
      },
    );
  };

  const handleTrial = (planId: string) => {
    setLoadingPlanId(planId);
    trial(planId, {
      onSuccess: () => {
        toast.success("Free trial started", "Enjoy your trial period!");
        navigate("/subscription");
      },
      onError: (err) => {
        handleApiError(err);
        setLoadingPlanId(null);
      },
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden px-4 md:px-8 py-6">
      {/* Header */}
      <div className="mb-5 shrink-0">
        <button
          onClick={() => navigate("/subscription")}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer mb-3"
        >
          <MdArrowBack size={14} />
          Back to Subscription
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 mb-1">Subscription Plans</h1>
            <p className="text-xs text-slate-400">Choose the plan that works best for you</p>
          </div>
          <BillingCycleToggle value={billingCycle} onChange={setBillingCycle} />
        </div>

        {billingCycle === "YEARLY" && (
          <p className="text-xs text-green-600 font-semibold mt-2">
            Save with yearly billing — pay annually at a discounted rate
          </p>
        )}
      </div>

      {/* Plans grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <PlanCardSkeleton key={i} />)
            : activePlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  billingCycle={billingCycle}
                  isCurrent={plan.id === currentPlanId}
                  hasSubscription={!!subscription}
                  onSubscribe={handleSubscribe}
                  onTrial={handleTrial}
                  isLoading={loadingPlanId === plan.id}
                />
              ))}
        </div>

        {!isLoading && activePlans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-sm font-medium text-slate-500">No plans available</p>
            <p className="text-xs text-slate-400 mt-1">Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
