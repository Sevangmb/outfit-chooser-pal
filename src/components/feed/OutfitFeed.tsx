import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OutfitCard } from "./OutfitCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

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

export const OutfitFeed = () => {
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["outfits-feed"],
    queryFn: async ({ pageParam = 0 }) => {
      console.log("Fetching outfits for feed, page:", pageParam);
      
      // First, fetch outfits with their clothes
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

      // Then, fetch profiles for all user_ids
      const userIds = outfitsData.map((outfit: any) => outfit.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      // Create a map of user_id to email
      const emailMap = new Map(profiles?.map((p) => [p.id, p.email]));

      // Combine the data
      const formattedOutfits = outfitsData.map((outfit: any) => ({
        ...outfit,
        user_email: emailMap.get(outfit.user_id),
        clothes: outfit.clothes.map((item: any) => ({
          clothes: item.clothes,
        })),
      }));

      return {
        outfits: formattedOutfits,
        nextPage: outfitsData.length === ITEMS_PER_PAGE ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {outfits.map((outfit) => (
        <OutfitCard key={outfit.id} outfit={outfit} />
      ))}
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
  );
};