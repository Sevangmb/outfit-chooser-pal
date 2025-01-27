import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      if (user) {
        try {
          console.log("Checking profile completion for user:", user.id);
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("has_completed_onboarding")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error("Error fetching profile data:", error);
            setIsProfileComplete(false);
          } else {
            console.log("Profile completion status:", profile?.has_completed_onboarding);
            setIsProfileComplete(profile?.has_completed_onboarding ?? false);
          }
        } catch (error) {
          console.error("Error in checkAuth:", error);
          setIsProfileComplete(false);
        }
      }
      setCheckingProfile(false);
    };

    checkAuth();
  }, [user]);

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (isProfileComplete === false && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};