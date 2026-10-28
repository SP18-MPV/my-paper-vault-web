const required = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
};

export const env = {
  apiUrl: required("VITE_API_URL"),
  // Deep link that opens the mobile app after a payment started from the
  // welcome email (set in CI; the default matches the app's URL scheme).
  mobileReturnUrl:
    import.meta.env.VITE_MOBILE_RETURN_URL || "mypapervault://subscription/success",
};
