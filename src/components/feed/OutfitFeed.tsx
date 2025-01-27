import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";
import { FeedHeader } from "./FeedHeader";
import { AIFeatures } from "./AIFeatures";
import { EmptyFeed } from "./EmptyFeed";
import { OutfitGrid } from "./OutfitGrid";

const ITEMS_PER_PAGE = 10;

export const OutfitFeed = () => {
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    error
  } = useInfiniteQuery({
    queryKey: ["outfits-feed"],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      console.log("Fetching outfits for feed, page:", pageParam);
      
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
        console.log("No outfits found for page", pageParam);
        return {
          outfits: [],
          nextPage: null
        };
      }

      const userIds = [...new Set(outfitsData.map(outfit => outfit.user_id))];
      console.log("Fetching users for outfits:", userIds);

      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, email")
        .in("id", userIds);

      if (usersError) {
        console.error("Error fetching users:", usersError);
        throw usersError;
      }

      const emailMap = new Map(users?.map(user => [user.id, user.email]) || []);

      const formattedOutfits = outfitsData.map(outfit => ({
        ...outfit,
        user_email: emailMap.get(outfit.user_id) || "Utilisateur inconnu",
        clothes: outfit.clothes.map(item => ({
          clothes: item.clothes,
        })),
      }));

      console.log("Formatted outfits:", formattedOutfits);

      return {
        outfits: formattedOutfits,
        nextPage: formattedOutfits.length === ITEMS_PER_PAGE ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      console.log("Loading next page...");
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (error) {
    console.error("Feed error:", error);
    return (
      <div className="text-center py-12 space-y-6">
        <p className="text-destructive">Une erreur est survenue lors du chargement des tenues</p>
        <Button onClick={() => refetch()}>Réessayer</Button>
      </div>
    );
  }

  const allOutfits = data?.pages.flatMap(page => page.outfits) || [];
  console.log("All outfits:", allOutfits);

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 bg-background pb-4">
        <FeedHeader />
        <AIFeatures />
      </div>

      <div className="relative">
        {isRefetching && !isFetchingNextPage && (
          <div className="absolute top-0 left-0 right-0 flex justify-center py-4 bg-background/80 backdrop-blur-sm z-10">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        )}

        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[400px] rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && allOutfits.length === 0 && <EmptyFeed />}

        {!isLoading && allOutfits.length > 0 && (
          <OutfitGrid 
            outfits={allOutfits}
            isFetchingNextPage={isFetchingNextPage}
            observerRef={ref}
          />
        )}
      </div>
    </div>
  );
};