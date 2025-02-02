import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle } from "lucide-react";

const DatabaseStatus = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["databaseStatus"],
    queryFn: async () => {
      const { error } = await supabase.from("profiles").select("*").limit(1);
      if (error) throw new Error("Database connection failed");
      return true;
    },
    refetchInterval: 60000, // Refresh every 60 seconds
  });

  if (isLoading) {
    return <div className="flex items-center">Checking database status...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center text-red-600">
        <XCircle className="w-5 h-5 mr-2" />
        Disconnected
      </div>
    );
  }

  return (
    <div className="flex items-center text-green-600">
      <CheckCircle className="w-5 h-5 mr-2" />
      Connected
    </div>
  );
};

export default DatabaseStatus;
