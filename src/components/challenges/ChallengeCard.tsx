import { Trophy, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    prize: string;
    participants_count?: number;
    user_participated?: boolean;
  };
  onParticipate?: () => void;
}

export const ChallengeCard = ({ challenge, onParticipate }: ChallengeCardProps) => {
  const [isParticipating, setIsParticipating] = useState(
    challenge.user_participated
  );

  const handleParticipate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté pour participer");
        return;
      }

      const { error } = await supabase
        .from("challenge_participants")
        .insert([
          {
            challenge_id: challenge.id,
            user_id: user.id,
          },
        ]);

      if (error) throw error;

      setIsParticipating(true);
      toast.success("Vous participez maintenant à ce défi !");
      if (onParticipate) onParticipate();
    } catch (error) {
      console.error("Error participating in challenge:", error);
      toast.error("Erreur lors de la participation au défi");
    }
  };

  const startDate = new Date(challenge.start_date);
  const endDate = new Date(challenge.end_date);
  const now = new Date();
  const progress = Math.min(
    100,
    Math.max(
      0,
      ((now.getTime() - startDate.getTime()) /
        (endDate.getTime() - startDate.getTime())) *
        100
    )
  );

  return (
    <div className="border rounded-lg p-6 space-y-4 bg-card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {challenge.title}
          </h3>
          <p className="text-sm text-muted-foreground">{challenge.description}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
            </span>
          </div>
          {challenge.participants_count !== undefined && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{challenge.participants_count} participants</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            Prix: <span className="text-primary">{challenge.prize}</span>
          </div>
          <Button
            onClick={handleParticipate}
            disabled={isParticipating}
          >
            {isParticipating ? "Déjà participant" : "Participer"}
          </Button>
        </div>
      </div>
    </div>
  );
};