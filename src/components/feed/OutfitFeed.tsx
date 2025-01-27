import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OutfitGrid } from "./OutfitGrid";
import { EmptyFeed } from "./EmptyFeed";

const ITEMS_PER_PAGE = 9;

interface OutfitFeedProps {
  filter?: "trending" | "following";
}

export const OutfitFeed = ({ filter }: OutfitFeedProps) => {
  const { ref, inView } = useInView();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["outfits-feed", filter],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      console.log("Starting to fetch outfits page:", pageParam, "with filter:", filter);
      
      const start = pageParam * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;
      
      let query = supabase
        .from("outfits")
        .select(`
          *,
          clothes:outfit_clothes(
            clothes(id, name, category, color, image)
          ),
          profiles!outfits_profiles_user_id_fkey(email)
        `, { count: 'exact' });

      if (filter === "trending") {
        query = query.order('rating', { ascending: false });
      } else if (filter === "following") {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: following } = await supabase
            .from('followers')
            .select('following_id')
            .eq('follower_id', user.id);
          
          const followingIds = following?.map(f => f.following_id) || [];
          query = query.in('user_id', followingIds);
        }
      }

      const { data: outfits, error: outfitsError, count } = await query
        .order('created_at', { ascending: false })
        .range(start, end);

      if (outfitsError) {
        console.error("Error fetching outfits:", outfitsError);
        throw outfitsError;
      }

      if (!outfits || outfits.length === 0) {
        console.log("No outfits found for this page");
        return {
          outfits: [],
          nextPage: null
        };
      }

      const formattedOutfits = outfits.map(outfit => ({
        ...outfit,
        user_email: outfit.profiles?.email || "Utilisateur inconnu",
        clothes: outfit.clothes || []
      }));

      const hasMore = count ? start + outfits.length < count : false;

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

  if (status === "pending") {
    return <OutfitGrid outfits={[]} isFetchingNextPage={true} observerRef={ref} />;
  }

  if (status === "error") {
    console.error("Error in OutfitFeed:", error);
    return <div>Une erreur s'est produite lors du chargement des tenues.</div>;
  }

  const allOutfits = data?.pages.flatMap(page => page.outfits) || [];

  if (allOutfits.length === 0) {
    return <EmptyFeed />;
  }

  return (
    <div className="space-y-6">
      <OutfitGrid 
        outfits={allOutfits}
        isFetchingNextPage={isFetchingNextPage}
        observerRef={ref}
      />
    </div>
  );
};