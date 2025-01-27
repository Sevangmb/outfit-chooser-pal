import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, loading } = useAuth();
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      if (user) {
        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("has_completed_onboarding")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error("Error fetching user data:", error);
            setIsProfileComplete(false);
          } else {
            setIsProfileComplete(profile?.has_completed_onboarding ?? false);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setIsProfileComplete(false);
        }
      }
      setCheckingProfile(false);
    };

    checkAuth();
  }, [user]);

  if (loading || checkingProfile) {
    return <div>Chargement...</div>;
  }

  if (user) {
    if (isProfileComplete === false) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};