import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Login = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Redirect authenticated users to the home page
      navigate("/");
      toast.success("Vous êtes déjà connecté!");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Connexion à FRING
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Veuillez vous connecter pour continuer
          </p>
        </div>

        <div className="mt-8 bg-card p-6 rounded-lg shadow-sm border space-y-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
