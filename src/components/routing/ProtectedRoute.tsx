import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error checking session:", sessionError);
          // Try to refresh the session
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error("Error refreshing session:", refreshError);
            setIsAuthenticated(false);
            toast.error("Votre session a expiré. Veuillez vous reconnecter.");
            await supabase.auth.signOut();
          } else if (refreshData.session) {
            console.log("Session refreshed successfully");
            setIsAuthenticated(true);
          }
        } else {
          setIsAuthenticated(!!session);
        }
      } catch (error) {
        console.error("Error in checkAuth:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, "Session:", !!session);
      
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setIsAuthenticated(false);
        // Ensure clean logout
        await supabase.auth.signOut();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to landing");
    return <Navigate to="/landing" replace />;
  }

  return (
    <>
      {children}
      <BottomNav />
    </>
  );
};