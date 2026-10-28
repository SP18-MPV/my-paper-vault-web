import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { initializePayment, verifyPayment } from "@/api/endpoints/payments";
import { handleApiError } from "@/errors/errorHandler";

export const useInitializePayment = () =>
  useMutation({
    mutationFn: ({
      planId,
      billingCycle,
    }: {
      planId: string;
      billingCycle: "MONTHLY" | "YEARLY";
    }) => initializePayment(planId, billingCycle),
    onError: handleApiError,
  });

// No error toast: the callback page shows its own failure state.
export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      txRef,
      transactionId,
    }: {
      txRef: string;
      transactionId: string;
    }) => verifyPayment(txRef, transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.me() });
    },
  });
};
