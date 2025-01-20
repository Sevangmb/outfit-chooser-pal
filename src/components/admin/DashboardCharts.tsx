import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { subDays, format } from "date-fns";
import { fr } from "date-fns/locale";

type TimeRange = "7" | "30" | "90";

export const DashboardCharts = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("30");

  const startDate = subDays(new Date(), parseInt(timeRange));
  const endDate = new Date();

  const { data: newUsers } = useQuery({
    queryKey: ["newUsers", timeRange],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_new_users_per_day", {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });
      return data || [];
    }
  });

  const { data: activeUsers } = useQuery({
    queryKey: ["activeUsers", timeRange],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_daily_active_users", {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });
      return data || [];
    }
  });

  const { data: outfits } = useQuery({
    queryKey: ["outfitsPerDay", timeRange],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_outfits_per_day", {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });
      return data || [];
    }
  });

  const { data: votes } = useQuery({
    queryKey: ["votesPerDay", timeRange],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_votes_per_day", {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });
      return data || [];
    }
  });

  const { data: retention } = useQuery({
    queryKey: ["retention", timeRange],
    queryFn: async () => {
      const { data } = await supabase.rpc("calculate_user_retention", {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        retention_period: "7 days"
      });
      return data || [];
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select
          value={timeRange}
          onValueChange={(value) => setTimeRange(value as TimeRange)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sélectionner une période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 derniers jours</SelectItem>
            <SelectItem value="30">30 derniers jours</SelectItem>
            <SelectItem value="90">90 derniers jours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nouveaux Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[300px]" config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={newUsers}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), "dd/MM", { locale: fr })}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="new_users"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary)/.2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[300px]" config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeUsers}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), "dd/MM", { locale: fr })}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="active_users"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary)/.2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tenues Créées</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[300px]" config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={outfits}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), "dd/MM", { locale: fr })}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="outfits_count"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary)/.2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[300px]" config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={votes}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), "dd/MM", { locale: fr })}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="votes_count"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary)/.2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Taux de Rétention (7 jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[300px]" config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={retention}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), "dd/MM", { locale: fr })}
                  />
                  <YAxis unit="%" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="retention_rate"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary)/.2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};