import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdCheckCircleOutline,
  MdErrorOutline,
  MdHourglassEmpty,
} from "react-icons/md";
import Button from "@/components/common/Button/Button";
import Navbar from "@/components/layout/Navbar/Navbar";
import { env } from "@/config/env";
import { useVerifyPayment } from "@/hooks/usePayments";
import {
  clearReturnToApp,
  shouldReturnToApp,
} from "@/utils/mobileReturn.utils";

type Outcome = "verifying" | "success" | "pending" | "failed" | "cancelled";

const appLink = (status: "success" | "cancelled", txRef?: string | null) => {
  const url = new URL(env.mobileReturnUrl);
  url.searchParams.set("status", status);
  if (txRef) url.searchParams.set("tx_ref", txRef);
  return url.toString();
};

// Flutterwave redirects here after checkout:
// /payments/callback?status=successful|completed|cancelled|failed&tx_ref=…&transaction_id=…
// The query string is never trusted: the backend re-checks the payment with
// Flutterwave before activating anything.
const PaymentCallback = () => {
  const navigate = useNavigate();
  const { mutateAsync: verify } = useVerifyPayment();

  const [params] = useState(() => new URLSearchParams(window.location.search));
  const flwStatus = params.get("status");
  const txRef = params.get("tx_ref");
  const transactionId = params.get("transaction_id");

  // Came from the mobile app via the welcome email: send them back there.
  const [returnToApp] = useState(shouldReturnToApp);
  const initialOutcome: Outcome =
    flwStatus === "cancelled"
      ? "cancelled"
      : !txRef || !transactionId
        ? "failed"
        : "verifying";
  const [outcome, setOutcome] = useState<Outcome>(initialOutcome);

  // StrictMode runs effects twice in development; verify once.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (initialOutcome !== "verifying") return;

    // Awaiting the promise rather than mutate()'s callbacks — see MagicAuth.
    verify({ txRef: txRef!, transactionId: transactionId! })
      .then((res) => {
        const status = res.success ? res.data.transaction.status : "FAILED";
        if (status === "SUCCESSFUL") {
          setOutcome("success");
          if (returnToApp) {
            clearReturnToApp();
            window.location.href = appLink("success", txRef);
          }
        } else if (status === "PENDING") {
          setOutcome("pending");
        } else {
          setOutcome("failed");
        }
      })
      .catch(() => setOutcome("failed"));
  }, [initialOutcome, verify, txRef, transactionId, returnToApp]);

  const content: Record<
    Exclude<Outcome, "verifying">,
    { icon: React.ReactNode; title: string; body: string }
  > = {
    success: {
      icon: <MdCheckCircleOutline size={28} className="text-green-600" />,
      title: "Payment successful",
      body: returnToApp
        ? "Your plan is active. Opening the My Paper Vault app…"
        : "Your plan is active. Thank you for subscribing!",
    },
    pending: {
      icon: <MdHourglassEmpty size={28} className="text-amber-500" />,
      title: "Payment is processing",
      body: "Flutterwave hasn't confirmed your payment yet. Your plan will activate automatically once it does — usually within a few minutes.",
    },
    failed: {
      icon: <MdErrorOutline size={28} className="text-red-500" />,
      title: "Payment didn't go through",
      body: "You haven't been charged for a plan. Please try again, or use a different payment method.",
    },
    cancelled: {
      icon: <MdErrorOutline size={28} className="text-slate-400" />,
      title: "Payment cancelled",
      body: "No payment was taken. You can choose a plan again whenever you're ready.",
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-white">
        <div className="w-full max-w-md text-center">
          {outcome === "verifying" ? (
            <>
              <div className="w-8 h-8 mx-auto mb-5 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <h1 className="text-xl font-bold text-slate-900">
                Confirming your payment…
              </h1>
            </>
          ) : (
            <>
              <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-slate-50 flex items-center justify-center">
                {content[outcome].icon}
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
                {content[outcome].title}
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed mb-8">
                {content[outcome].body}
              </p>

              <div className="flex flex-col gap-3">
                {outcome === "success" && returnToApp && (
                  // Browsers may block opening an app without a tap, so
                  // the automatic redirect always has a manual fallback.
                  <Button
                    label="Open the My Paper Vault app"
                    variant="contained"
                    className="w-full justify-center"
                    onClick={() => {
                      window.location.href = appLink("success", txRef);
                    }}
                  />
                )}
                {outcome === "success" && !returnToApp && (
                  <Button
                    label="Go to my subscription"
                    variant="contained"
                    className="w-full justify-center"
                    onClick={() => navigate("/subscription", { replace: true })}
                  />
                )}
                {(outcome === "failed" || outcome === "cancelled") && (
                  <Button
                    label="Choose a plan again"
                    variant="contained"
                    className="w-full justify-center"
                    onClick={() =>
                      navigate("/subscription/plans", { replace: true })
                    }
                  />
                )}
                {outcome !== "success" && returnToApp && (
                  <Button
                    label="Back to the app"
                    variant="outlined"
                    className="w-full justify-center"
                    onClick={() => {
                      clearReturnToApp();
                      window.location.href = appLink("cancelled", txRef);
                    }}
                  />
                )}
                {outcome === "pending" && !returnToApp && (
                  <Button
                    label="Go to my subscription"
                    variant="outlined"
                    className="w-full justify-center"
                    onClick={() => navigate("/subscription", { replace: true })}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;
