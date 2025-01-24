import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OutfitCard } from "@/components/feed/OutfitCard";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

interface Outfit {
  id: number;
  name: string;
  description: string | null;
  user_id: string;
  rating: number;
  created_at: string;
  user_email?: string;
  clothes: {
    clothes: {
      id: number;
      name: string;
      category: string;
      color: string;
      image: string | null;
    };
  }[];
}

interface UserPreference {
  id: number;
  user_id: string;
  category: string;
  color: string;
  created_at: string;
}

interface PageData {
  outfits: Outfit[];
  nextPage: number | null;
}

const ITEMS_PER_PAGE = 6;

export const RecommendedOutfits = () => {
  const { ref, inView } = useInView();

  // Cache les préférences utilisateur pendant 5 minutes
  const { data: userPreferences } = useQuery<UserPreference[]>({
    queryKey: ["user-preferences"],
    queryFn: async () => {
      console.log("Fetching user preferences...");
      const { data: preferences, error } = await supabase
        .from("user_preferences")
        .select("*");

      if (error) {
        console.error("Error fetching user preferences:", error);
        throw error;
      }

      return preferences;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Cache les tenues recommandées pendant 2 minutes
  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage,
    isFetchingNextPage 
  } = useInfiniteQuery<PageData>({
    queryKey: ["recommended-outfits", userPreferences],
    queryFn: async ({ pageParam = 0 }) => {
      if (!userPreferences?.length) return { outfits: [], nextPage: null };

      console.log("Fetching recommended outfits for page:", pageParam);
      const preferredCategories = userPreferences.map((pref) => pref.category);
      const preferredColors = userPreferences.map((pref) => pref.color);

      const from = Number(pageParam) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data: outfitsData, error: outfitsError } = await supabase
        .from("outfits")
        .select(`
          *,
          clothes:outfit_clothes(
            clothes(id, name, category, color, image)
          )
        `)
        .order("rating", { ascending: false })
        .range(from, to);

      if (outfitsError) {
        console.error("Error fetching recommended outfits:", outfitsError);
        throw outfitsError;
      }

      // Fetch user emails
      const userIds = outfitsData.map((outfit: any) => outfit.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      const emailMap = new Map(profiles?.map((p) => [p.id, p.email]));

      // Filter and sort outfits based on preferences
      const outfitsWithScores = outfitsData.map((outfit: any) => {
        const clothes = outfit.clothes.map((item: any) => item.clothes);
        const preferenceScore = clothes.reduce((score: number, clothing: any) => {
          if (preferredCategories.includes(clothing.category)) score += 1;
          if (preferredColors.includes(clothing.color)) score += 1;
          return score;
        }, 0);

        return {
          ...outfit,
          user_email: emailMap.get(outfit.user_id),
          clothes: outfit.clothes.map((item: any) => ({
            clothes: item.clothes,
          })),
          preferenceScore,
        };
      });

      const sortedOutfits = outfitsWithScores.sort((a, b) => b.preferenceScore - a.preferenceScore);
      const hasMore = sortedOutfits.length === ITEMS_PER_PAGE;

      return {
        outfits: sortedOutfits,
        nextPage: hasMore ? Number(pageParam) + 1 : null,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!userPreferences?.length,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Charger plus de tenues quand l'utilisateur atteint le bas de la page
  useEffect(() => {
    if (inView && !isLoading && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  if (!userPreferences?.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Recommandés pour vous</h2>
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[400px] rounded-xl" />
          ))}
        </div>
      ) : data?.pages[0].outfits.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.pages.map((page) =>
              page.outfits.map((outfit: Outfit) => (
                <OutfitCard key={outfit.id} outfit={outfit} />
              ))
            )}
          </div>
          {/* Intersection Observer target */}
          <div ref={ref} className="h-20 flex items-center justify-center">
            {isFetchingNextPage && (
              <div className="grid grid-cols-3 gap-4 w-full">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-[400px] rounded-xl" />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Aucune recommandation disponible
        </div>
      )}
    </div>
  );
};