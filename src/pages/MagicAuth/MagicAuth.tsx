import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdLinkOff } from "react-icons/md";
import Button from "@/components/common/Button/Button";
import Navbar from "@/components/layout/Navbar/Navbar";
import { useMagicLinkSignIn } from "@/hooks/useAuth";
import { markReturnToApp } from "@/utils/mobileReturn.utils";

const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

// Landing page for the welcome email's one-time link:
// /auth/magic?token=<64 hex chars>. Exchanges the token for a session, then
// shows the subscription plans. Payment happens here on the web; afterwards
// the user is sent back to the mobile app.
const MagicAuth = () => {
  const navigate = useNavigate();
  const { mutateAsync: signInWithMagicLink } = useMagicLinkSignIn();
  const [failed, setFailed] = useState(false);

  // Read the token once, before it's removed from the address bar.
  const [token] = useState(() =>
    new URLSearchParams(window.location.search).get("token"),
  );
  const tokenIsValid = !!token && TOKEN_PATTERN.test(token);
  // StrictMode runs effects twice in development; the token works only once.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    // Keep the one-time token out of browser history and the Referer header.
    window.history.replaceState(null, "", window.location.pathname);

    if (!tokenIsValid) return;

    // Awaiting the promise, not mutate()'s per-call callbacks: those only
    // fire while the component's original observer is attached, and
    // StrictMode's mount/unmount/remount in development detaches it, which
    // left this page spinning after a successful sign-in.
    signInWithMagicLink(token)
      .then((data) => {
        if (!data.success) {
          setFailed(true);
          return;
        }
        markReturnToApp();
        navigate("/subscription/plans", { replace: true });
      })
      .catch(() => setFailed(true));
  }, [token, tokenIsValid, signInWithMagicLink, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-white">
        <div className="w-full max-w-md text-center">
          {failed || !tokenIsValid ? (
            <>
              <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                <MdLinkOff size={24} />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
                This link has expired
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed mb-8">
                Sign-in links work once and only for a short time. Sign in with
                your email and password to see the plans.
              </p>
              <Button
                label="Sign in"
                variant="contained"
                className="w-full justify-center"
                onClick={() => navigate("/login", { replace: true })}
              />
            </>
          ) : (
            <>
              <div className="w-8 h-8 mx-auto mb-5 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <h1 className="text-xl font-bold text-slate-900">
                Signing you in…
              </h1>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MagicAuth;
