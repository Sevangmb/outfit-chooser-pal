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
      console.log("Starting to fetch outfits page:", pageParam);
      
      const start = pageParam * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;
      
      console.log(`Fetching range ${start} to ${end}`);

      const { data: outfits, error: outfitsError, count } = await supabase
        .from("outfits")
        .select(`
          *,
          clothes:outfit_clothes(
            clothes(id, name, category, color, image)
          ),
          user:users(email)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end);

      if (outfitsError) {
        console.error("Error fetching outfits:", outfitsError);
        throw outfitsError;
      }

      console.log("Fetched outfits:", outfits);
      console.log("Total count:", count);

      if (!outfits || outfits.length === 0) {
        console.log("No outfits found for this page");
        return {
          outfits: [],
          nextPage: null
        };
      }

      const formattedOutfits = outfits.map(outfit => {
        console.log("Processing outfit:", outfit.id, "User:", outfit.user?.email);
        return {
          ...outfit,
          user_email: outfit.user?.email || "Utilisateur inconnu",
          clothes: outfit.clothes || []
        };
      });

      console.log("Formatted outfits:", formattedOutfits);

      const hasMore = count ? start + outfits.length < count : false;
      console.log("Has more pages:", hasMore);

      return {
        outfits: formattedOutfits,
        nextPage: hasMore ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      console.log("Loading next page due to scroll...");
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
  console.log("Total outfits rendered:", allOutfits.length);

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