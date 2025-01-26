import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, History } from "lucide-react";

const Contest = () => {
  const { data: challenges = [], refetch } = useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      console.log("Fetching challenges...");
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from("challenges")
        .select(`
          *,
          challenge_participants (
            user_id
          )
        `)
        .eq("is_active", true)
        .order("start_date", { ascending: false });

      if (challengesError) throw challengesError;

      // Get participation count for each challenge
      const challengesWithCounts = await Promise.all(
        challengesData.map(async (challenge) => {
          const { count } = await supabase
            .from("challenge_participants")
            .select("*", { count: "exact" })
            .eq("challenge_id", challenge.id);

          return {
            ...challenge,
            participants_count: count,
            user_participated: challenge.challenge_participants.some(
              (p: any) => p.user_id === user?.id
            ),
          };
        })
      );

      console.log("Challenges fetched:", challengesWithCounts);
      return challengesWithCounts;
    },
  });

  const activeChallenge = challenges.find(
    (c) =>
      new Date(c.start_date) <= new Date() && new Date(c.end_date) >= new Date()
  );

  const upcomingChallenges = challenges.filter(
    (c) => new Date(c.start_date) > new Date()
  );

  const pastChallenges = challenges.filter(
    (c) => new Date(c.end_date) < new Date()
  );

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex items-center gap-2 mb-8">
        <Trophy className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Défis et challenges</h1>
      </div>

      {activeChallenge && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" />
            Challenge en cours
          </h2>
          <ChallengeCard
            challenge={activeChallenge}
            onParticipate={refetch}
          />
        </div>
      )}

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">À venir</TabsTrigger>
          <TabsTrigger value="past">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onParticipate={refetch}
            />
          ))}
          {upcomingChallenges.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              Aucun challenge à venir pour le moment
            </p>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onParticipate={refetch}
            />
          ))}
          {pastChallenges.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              Aucun challenge passé
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Contest;