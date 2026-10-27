import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/authStore";
import { useSubscription } from "@/hooks/useSubscription";
import FamilyAccess from "@/pages/FamilyAccess";
import FamilyVaults from "@/pages/FamilyVaults/FamilyVaults";
import MyLinks from "@/pages/MyLinks/MyLinks";
import FamilyMembers from "@/pages/FamilyMembers/FamilyMembers";
import Profile from "@/pages/Profile";
const LinkDetails = lazy(() => import("@/pages/LinkDetails"));
const Subscription = lazy(() => import("@/pages/Subscription"));
const SubscriptionPlans = lazy(() => import("@/pages/SubscriptionPlans"));
const Security = lazy(() => import("@/pages/Security"));
const Devices = lazy(() => import("@/pages/Devices"));

const Landing = lazy(() => import("@/pages/Landing"));
const Home = lazy(() => import("@/pages/Home/Home"));
const Login = lazy(() => import("@/pages/Login"));
const DocumentArchive = lazy(() => import("@/pages/DocumentArchive"));
const VaultDocuments = lazy(() => import("@/pages/VaultDocuments"));
const PublicUpload = lazy(() => import("@/pages/PublicUpload"));
const MagicAuth = lazy(() => import("@/pages/MagicAuth"));

const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-64">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Requires session — redirects to /login if not authenticated
const ProtectedRoute = () => {
  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);
  useSubscription();

  if (isLoading) return <PageLoader />;
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
};

// Requires NO session — redirects to /home if already authenticated
const PublicOnlyRoute = () => {
  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) return <PageLoader />;
  if (session) return <Navigate to="/home" replace />;
  return <Outlet />;
};

function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public only — redirect to /home if logged in */}
        <Route element={<PublicOnlyRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Landing />} />
          </Route>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Fully public — accessible regardless of auth state */}
        <Route path="/upload/:token" element={<PublicUpload />} />
        {/* Welcome-email sign-in link. Not under PublicOnlyRoute: a signed-in
            visitor must still have the link processed, not bounced to /home. */}
        <Route path="/auth/magic" element={<MagicAuth />} />

        {/* Private — redirect to /login if not logged in */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/documents" element={<DocumentArchive />} />
            <Route path="/family-members" element={<FamilyMembers />} />
            <Route path="/family-access" element={<FamilyAccess />} />
            <Route path="/family-vaults" element={<FamilyVaults />} />
            <Route
              path="/vaults/directory/:directoryId"
              element={<VaultDocuments />}
            />
            <Route path="/my-links" element={<MyLinks />} />
            <Route path="/my-links/:id" element={<LinkDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/subscription/plans" element={<SubscriptionPlans />} />
            <Route path="/settings/security" element={<Security />} />
            <Route path="/settings/devices" element={<Devices />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
