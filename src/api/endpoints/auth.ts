import { apiClient } from "../client";
import type { components } from "../types";
import { getDeviceHeaders } from "@/utils/deviceInfo.utils";

export type SignupResponse = components["schemas"]["SignupResponse"];
export type SignoutResponse = components["schemas"]["SignoutResponse"];
export type SigninResponse = components["schemas"]["SigninResponse"];
export type ResendSignupCodeResponse =
  components["schemas"]["ResendVerificationResponse"];
export type SignupVerifyResponse = components["schemas"]["VerifyUserResponse"];
export type GetUserSessionsResponse =
  components["schemas"]["GetUserSessionsResponse"];
export type UserSession = GetUserSessionsResponse["data"][number];

export const signIn = async (body: {
  email: string;
  password: string;
}): Promise<SigninResponse> => {
  const deviceHeaders = getDeviceHeaders();
  const { data } = await apiClient.POST("/auth/signin", {
    body,
    headers: deviceHeaders,
  });
  return data!;
};

export type MagicLinkExchangeResponse =
  components["schemas"]["MagicLinkExchangeResponse"];

// Exchanges the one-time token from the welcome email's link for a session.
export const exchangeMagicLink = async (
  token: string,
): Promise<MagicLinkExchangeResponse> => {
  const { data } = await apiClient.POST("/auth/magic-link/exchange", {
    body: { token },
    headers: getDeviceHeaders(),
  });
  return data!;
};

export const signUp = async (body: {
  email: string;
  name: string;
  password: string;
}): Promise<SignupResponse> => {
  const { data } = await apiClient.POST("/auth/signup", { body });
  return data!;
};

export const signOut = async (): Promise<SignoutResponse> => {
  const { data } = await apiClient.POST("/auth/signout", {});
  return data!;
};

export const resendVerificationCode = async (body: {
  email: string;
}): Promise<ResendSignupCodeResponse> => {
  const { data } = await apiClient.POST("/auth/resend-verification", { body });
  return data!;
};

export const verifyUserCode = async (body: {
  code: string;
  email: string;
  password?: string;
}): Promise<SignupVerifyResponse> => {
  const { data } = await apiClient.POST("/auth/verify", { body });
  return data!;
};

export type ChangePasswordResponse =
  components["schemas"]["ChangePasswordResponse"];
export type SignoutAllResponse = components["schemas"]["SignoutAllResponse"];
export type ForgotPasswordResponse =
  components["schemas"]["ForgotPasswordResponse"];
export type ResetPasswordResponse =
  components["schemas"]["ResetPasswordResponse"];

export const forgotPassword = async (body: {
  email: string;
}): Promise<ForgotPasswordResponse> => {
  const { data } = await apiClient.POST("/auth/forgot-password", { body });
  return data!;
};

export const resetPassword = async (body: {
  email: string;
  code: string;
  new_password: string;
}): Promise<ResetPasswordResponse> => {
  const { data } = await apiClient.POST("/auth/reset-password", { body });
  return data!;
};

export const changePassword = async (body: {
  old_password: string;
  new_password: string;
}): Promise<ChangePasswordResponse> => {
  const { data } = await apiClient.POST("/auth/change-password", { body });
  return data!;
};

export const signOutAll = async (): Promise<SignoutAllResponse> => {
  const { data } = await apiClient.POST("/auth/signout-all", {});
  return data!;
};

export type RevokeSessionResponse =
  components["schemas"]["RevokeSessionByIdResponse"];

export const getUserSessions = async (): Promise<GetUserSessionsResponse> => {
  const { data } = await apiClient.GET("/auth/sessions");
  return data!;
};

export const revokeSession = async (
  sessionId: string,
): Promise<RevokeSessionResponse> => {
  const { data } = await apiClient.DELETE("/auth/sessions/{sessionId}", {
    params: { path: { sessionId } },
  });
  return data!;
};
