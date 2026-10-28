import { apiClient } from "../client";
import type { components } from "../types";

export type InitializePaymentResponse =
  components["schemas"]["InitializePaymentResponse"];
export type VerifyPaymentResponse =
  components["schemas"]["VerifyPaymentResponse"];
export type PaymentStatus =
  VerifyPaymentResponse["data"]["transaction"]["status"];

// Starts a Flutterwave checkout for a paid plan; the user is then sent to
// payment_url and comes back to /payments/callback.
export const initializePayment = async (
  planId: string,
  billingCycle: "MONTHLY" | "YEARLY",
): Promise<InitializePaymentResponse> => {
  const { data } = await apiClient.POST("/payments/initialize", {
    body: { plan_id: planId, billing_cycle: billingCycle },
  });
  return data!;
};

// Asks the backend to confirm the payment with Flutterwave and activate the
// plan. Safe to call more than once for the same payment.
export const verifyPayment = async (
  txRef: string,
  transactionId: string,
): Promise<VerifyPaymentResponse> => {
  const { data } = await apiClient.POST("/payments/verify", {
    body: { tx_ref: txRef, transaction_id: transactionId },
  });
  return data!;
};
