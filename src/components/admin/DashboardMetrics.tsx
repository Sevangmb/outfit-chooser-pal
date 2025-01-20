import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shirt, Heart } from "lucide-react";

export const DashboardMetrics = () => {
  const { data: totalUsers } = useQuery({
    queryKey: ["totalUsers"],
    queryFn: async () => {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      return count || 0;
    }
  });

  const { data: totalOutfits } = useQuery({
    queryKey: ["totalOutfits"],
    queryFn: async () => {
      const { count } = await supabase
        .from("outfits")
        .select("*", { count: "exact", head: true });
      return count || 0;
    }
  });

  const { data: totalVotes } = useQuery({
    queryKey: ["totalVotes"],
    queryFn: async () => {
      const { count } = await supabase
        .from("outfit_votes")
        .select("*", { count: "exact", head: true });
      return count || 0;
    }
  });

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tenues</CardTitle>
          <Shirt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOutfits || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalVotes || 0}</div>
        </CardContent>
      </Card>
    </div>
  );
};