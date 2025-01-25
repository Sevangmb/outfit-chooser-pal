import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OutfitCard } from "./OutfitCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Home, Search, Users, Sparkles, CloudSun, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ReactPullToRefresh from "react-pull-to-refresh";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WeatherWidget } from "@/components/weather/WeatherWidget";

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
    isRefetching,
    error
  } = useInfiniteQuery<PageData>({
    queryKey: ["outfits-feed"],
    initialPageParam: 0,
    queryFn: async (context) => {
      const pageParam = Number(context.pageParam);
      console.log("Fetching outfits for feed, page:", pageParam);
      
      try {
        // First fetch outfits
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

        if (!outfitsData || outfitsData.length === 0) {
          return {
            outfits: [],
            nextPage: null
          };
        }

        // Get unique user IDs
        const userIds = [...new Set(outfitsData.map((outfit: any) => outfit.user_id))];
        console.log("Fetching profiles for users:", userIds);

        // Fetch profiles in smaller batches to avoid URL length issues
        const BATCH_SIZE = 5;
        const profiles: any[] = [];
        
        for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
          const batchIds = userIds.slice(i, i + BATCH_SIZE);
          const { data: batchProfiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, email")
            .in("id", batchIds);

          if (profilesError) {
            console.error("Error fetching profiles batch:", profilesError);
            continue;
          }

          if (batchProfiles) {
            profiles.push(...batchProfiles);
          }
        }

        const emailMap = new Map(profiles.map((p) => [p.id, p.email]));

        const formattedOutfits = outfitsData.map((outfit: any) => ({
          ...outfit,
          user_email: emailMap.get(outfit.user_id) || "Utilisateur inconnu",
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
    retry: 2,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = async () => {
    console.log("Refreshing feed...");
    try {
      await refetch();
      return Promise.resolve();
    } catch (error) {
      console.error("Error refreshing feed:", error);
      toast.error("Erreur lors du rafraîchissement");
      return Promise.reject(error);
    }
  };

  if (error) {
    return (
      <div className="text-center py-12 space-y-6">
        <p className="text-destructive">Une erreur est survenue lors du chargement des tenues</p>
        <Button onClick={() => refetch()}>Réessayer</Button>
      </div>
    );
  }

  return (
    <ReactPullToRefresh
      onRefresh={handleRefresh}
      className="relative min-h-screen"
      style={{
        textAlign: 'center',
        position: 'relative'
      }}
    >
      <div className="space-y-6">
        {/* Weather Widget - Placed at the top */}
        <WeatherWidget />

        {/* Challenge Banner */}
        <Alert>
          <Trophy className="h-4 w-4" />
          <AlertDescription>
            Challenge en cours : Créez votre tenue d'automne !
            <Button variant="link" className="pl-2" onClick={() => navigate("/contest")}>
              Participer
            </Button>
          </AlertDescription>
        </Alert>

        {/* AI Suggestions */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-auto py-4"
            onClick={() => toast.info("Suggestions IA bientôt disponibles")}
          >
            <Sparkles className="h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">Suggestions IA</div>
              <div className="text-sm text-muted-foreground">Basées sur vos préférences</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-auto py-4"
            onClick={() => navigate("/discover")}
          >
            <Search className="h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">Explorer</div>
              <div className="text-sm text-muted-foreground">Découvrir de nouvelles tenues</div>
            </div>
          </Button>
        </div>

        {/* Main Feed */}
        <div className="relative">
          {/* Pull to refresh indicator */}
          {isRefetching && !isFetchingNextPage && (
            <div className="absolute top-0 left-0 right-0 flex justify-center py-4 bg-background/80 backdrop-blur-sm z-10">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
            </div>
          )}

          {/* Initial loading state */}
          {isLoading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[400px] rounded-xl" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && data?.pages[0].outfits.length === 0 && (
            <div className="text-center py-12 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Home className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Bienvenue sur votre fil d'actualité</h2>
                <p className="text-muted-foreground max-w-sm">
                  Commencez à suivre d'autres utilisateurs ou explorez de nouvelles tenues pour personnaliser votre fil
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
          )}

          {/* Feed content */}
          {!isLoading && data?.pages[0].outfits.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.pages.flatMap((page) => 
                page.outfits.map((outfit) => (
                  <OutfitCard key={outfit.id} outfit={outfit} />
                ))
              )}
              
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
          )}
        </div>
      </div>
    </ReactPullToRefresh>
  );
};
