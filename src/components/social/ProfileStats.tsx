import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ProfileStatsProps {
  userId: string;
}

export const ProfileStats = ({ userId }: ProfileStatsProps) => {
  const { data: stats } = useQuery({
    queryKey: ["profileStats", userId],
    queryFn: async () => {
      const [followers, following, outfits] = await Promise.all([
        supabase
          .from("followers")
          .select("*", { count: "exact" })
          .eq("following_id", userId),
        supabase
          .from("followers")
          .select("*", { count: "exact" })
          .eq("follower_id", userId),
        supabase
          .from("outfits")
          .select("*", { count: "exact" })
          .eq("user_id", userId)
      ]);

      return {
        followers: followers.count || 0,
        following: following.count || 0,
        outfits: outfits.count || 0
      };
    }
  });

  const { data: categoryStats } = useQuery({
    queryKey: ["clothingCategoryStats", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clothes")
        .select("category")
        .eq("user_id", userId);

      if (error) throw error;

      const categories = data.reduce((acc: Record<string, number>, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(categories).map(([name, value]) => ({
        name,
        value
      }));
    }
  });

  const { data: colorStats } = useQuery({
    queryKey: ["clothingColorStats", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clothes")
        .select("color")
        .eq("user_id", userId);

      if (error) throw error;

      const colors = data.reduce((acc: Record<string, number>, item) => {
        acc[item.color] = (acc[item.color] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(colors).map(([name, value]) => ({
        name,
        value
      }));
    }
  });

  const COLORS = [
    "#9b87f5", "#7E69AB", "#6E59A5", "#D6BCFA", "#E5DEFF", 
    "#0EA5E9", "#1EAEDB", "#33C3F0", "#0FA0CE", "#D3E4FD"
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-around py-4 border-y border-border">
        <div className="text-center">
          <div className="text-2xl font-semibold text-primary">{stats?.outfits || 0}</div>
          <div className="text-sm text-muted-foreground">Tenues</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-primary">{stats?.followers || 0}</div>
          <div className="text-sm text-muted-foreground">Abonnés</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-primary">{stats?.following || 0}</div>
          <div className="text-sm text-muted-foreground">Abonnements</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Catégories Chart */}
        <div className="p-4 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-4 text-primary">Répartition par catégories</h3>
          <div className="h-[300px]">
            <ChartContainer
              className="w-full h-full"
              config={{
                category: { theme: { light: "#9b87f5", dark: "#7E69AB" } }
              }}
            >
              <BarChart data={categoryStats || []}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-category)" />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        {/* Couleurs Chart */}
        <div className="p-4 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-4 text-primary">Répartition par couleurs</h3>
          <div className="h-[300px] flex items-center justify-center">
            <PieChart width={300} height={300}>
              <Pie
                data={colorStats || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {colorStats?.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border border-border p-2 rounded-lg shadow-lg">
                        <p className="text-sm">{`${payload[0].name}: ${payload[0].value}`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </div>
        </div>
      </div>
    </div>
  );
};