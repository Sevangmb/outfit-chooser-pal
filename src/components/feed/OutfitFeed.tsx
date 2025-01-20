import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OutfitCard } from "./OutfitCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ReactPullToRefresh from "react-pull-to-refresh";

const ITEMS_PER_PAGE = 10;

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

interface PageData {
  outfits: Outfit[];
  nextPage: number | null;
}

export const OutfitFeed = () => {
  const { ref, inView } = useInView();
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching
  } = useInfiniteQuery<PageData>({
    queryKey: ["outfits-feed"],
    initialPageParam: 0,
    queryFn: async (context) => {
      const pageParam = Number(context.pageParam);
      console.log("Fetching outfits for feed, page:", pageParam);
      
      try {
        const { data: outfitsData, error: outfitsError } = await supabase
          .from("outfits")
          .select(`
            *,
            clothes:outfit_clothes(
              clothes(id, name, category, color, image)
            )
          `)
          .order("created_at", { ascending: false })
          .range(pageParam * ITEMS_PER_PAGE, (pageParam + 1) * ITEMS_PER_PAGE - 1);

        if (outfitsError) {
          console.error("Error fetching outfits:", outfitsError);
          throw outfitsError;
        }

        if (!outfitsData) {
          return {
            outfits: [],
            nextPage: null
          };
        }

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

        const formattedOutfits = outfitsData.map((outfit: any) => ({
          ...outfit,
          user_email: emailMap.get(outfit.user_id),
          clothes: outfit.clothes.map((item: any) => ({
            clothes: item.clothes,
          })),
        }));

        return {
          outfits: formattedOutfits,
          nextPage: outfitsData.length === ITEMS_PER_PAGE ? pageParam + 1 : null,
        };
      } catch (error) {
        console.error("Error in queryFn:", error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = async () => {
    console.log("Refreshing feed...");
    await refetch();
    return Promise.resolve();
  };

  // Initial loading state
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[400px] rounded-xl" />
        ))}
      </div>
    );
  }

  const outfits = data?.pages.flatMap((page) => page.outfits) ?? [];

  // Empty state
  if (outfits.length === 0) {
    return (
      <div className="text-center py-12 space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Users className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Aucune tenue à afficher</h2>
          <p className="text-muted-foreground max-w-sm">
            Commencez à suivre d'autres utilisateurs ou explorez de nouvelles tenues pour personnaliser votre fil d'actualité
          </p>
        </div>
        <Button 
          onClick={() => navigate("/discover")}
          className="gap-2"
        >
          <Search className="h-4 w-4" />
          Explorer les tenues
        </Button>
      </div>
    );
  }

  return (
    <ReactPullToRefresh
      onRefresh={handleRefresh}
      className="relative min-h-screen"
      pullDownThreshold={70}
      resistance={2.5}
    >
      <div className="relative">
        {/* Pull to refresh indicator */}
        {isRefetching && !isFetchingNextPage && (
          <div className="absolute top-0 left-0 right-0 flex justify-center py-4 bg-background/80 backdrop-blur-sm z-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {outfits.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} />
          ))}
          
          {/* Infinite scroll loading indicator */}
          <div ref={ref} className="col-span-full h-20 flex items-center justify-center">
            {isFetchingNextPage && (
              <div className="grid grid-cols-3 gap-4 w-full">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-[400px] rounded-xl" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ReactPullToRefresh>
  );
};