// Remembers, for this browser tab, that the user arrived from the mobile app
// (via the welcome email's magic link), so the payment flow can send them
// back to the app when it's done instead of to the web dashboard.
const RETURN_TO_APP_KEY = "return_to_app";

export const markReturnToApp = () => {
  sessionStorage.setItem(RETURN_TO_APP_KEY, "true");
};

export const shouldReturnToApp = () =>
  sessionStorage.getItem(RETURN_TO_APP_KEY) === "true";

export const clearReturnToApp = () => {
  sessionStorage.removeItem(RETURN_TO_APP_KEY);
};
