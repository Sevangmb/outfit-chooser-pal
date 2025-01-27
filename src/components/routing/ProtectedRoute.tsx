import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error("Error refreshing session:", refreshError);
            setIsAuthenticated(false);
            await supabase.auth.signOut();
          } else if (refreshData.session) {
            console.log("Session refreshed successfully");
            
            // Fetch user data after successful authentication
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', refreshData.session.user.id)
              .single();

            if (userError) {
              console.error("Error fetching user data:", userError);
            } else {
              console.log("User data fetched:", userData);
            }
            
            setIsAuthenticated(true);
          }
        } else {
          if (session) {
            // Fetch user data when session exists
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (userError) {
              console.error("Error fetching user data:", userError);
            } else {
              console.log("User data fetched:", userData);
            }
          }
          setIsAuthenticated(!!session);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        await supabase.auth.signOut();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          // Fetch user data on sign in
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError) {
            console.error("Error fetching user data:", userError);
          } else {
            console.log("User data fetched:", userData);
          }
        }
        setIsAuthenticated(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
};