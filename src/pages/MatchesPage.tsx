import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { matchesApi, type Match } from "../lib/api";
import { useCurrentUser } from "../lib/useCurrentUser";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Loader2, ArrowLeft, Calendar, Clock, AlertCircle } from "lucide-react";
import { AxiosError } from "axios";

export default function MatchesPage() {
  const navigate = useNavigate();
  const { userId: currentUserId } = useCurrentUser();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (currentUserId) {
      loadMatches();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  const loadMatches = async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      const response = await matchesApi.getAll(currentUserId);
      setMatches(response.items);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || "Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (match: Match) => {
    return match.userAId === currentUserId ? match.userB : match.userA;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not set";
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/profiles")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Your Matches</h1>
      </div>

      {!currentUserId ? (
        <Card className="mb-6 border-amber-500">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium">No user selected</p>
              <p className="text-sm text-muted-foreground">
                Please go to the Profiles page and click "Use as Me" on any
                profile to see your matches.
              </p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => navigate("/profiles")}
              >
                Go to Profiles
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {currentUserId && matches.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No matches yet. Go to Find People to start liking profiles!
            </p>
            <Button className="mt-4" onClick={() => navigate("/like")}>
              Find People
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {matches.map((match) => {
          const otherUser = getOtherUser(match);
          const hasScheduledDate = match.hasScheduledDate;

          // Get availabilities for current user and other user
          const myAvailabilities =
            match.availabilities?.filter((a) => a.userId === currentUserId) ||
            [];
          const otherAvailabilities =
            match.availabilities?.filter((a) => a.userId !== currentUserId) ||
            [];

          // Check if both have set availability but no scheduled date
          const bothHaveAvailability =
            myAvailabilities.length > 0 && otherAvailabilities.length > 0;
          const noCommonSlot = bothHaveAvailability && !hasScheduledDate;

          return (
            <Card key={match.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                    {otherUser?.name.substring(0, 2).toUpperCase() || "??"}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {otherUser?.name || "Unknown"}
                    </h3>
                    <p className="text-sm text-muted-foreground font-normal">
                      {otherUser?.age} • {otherUser?.gender}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Matched: {formatDate(match.matchedAt)}</span>
                  </div>

                  {hasScheduledDate &&
                  match.proposedDate &&
                  match.proposedTime ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        Date scheduled: {formatDate(match.proposedDate)} at{" "}
                        {match.proposedTime}
                      </span>
                    </div>
                  ) : noCommonSlot ? (
                    <div className="p-3 bg-amber-50 rounded-md border border-amber-200">
                      <div className="flex items-start gap-2 text-sm text-amber-800">
                        <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">
                            No common time slot found
                          </p>
                          <p className="text-xs mt-1">
                            Your schedules don't overlap. Try setting different
                            availability times.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : myAvailabilities.length > 0 ? (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        Waiting for {otherUser?.name} to set availability...
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <Clock className="w-4 h-4" />
                      <span>Set your availability to schedule a date</span>
                    </div>
                  )}

                  {/* Show my availability */}
                  {myAvailabilities.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm font-medium text-blue-900 mb-2">
                        Your Availability:
                      </p>
                      <div className="space-y-1">
                        {myAvailabilities.map((slot) => (
                          <div key={slot.id} className="text-xs text-blue-800">
                            {new Date(slot.date).toLocaleDateString()} •{" "}
                            {slot.startTime} - {slot.endTime}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show other user's availability */}
                  {otherAvailabilities.length > 0 && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-md">
                      <p className="text-sm font-medium text-purple-900 mb-2">
                        {otherUser?.name}'s Availability:
                      </p>
                      <div className="space-y-1">
                        {otherAvailabilities.map((slot) => (
                          <div
                            key={slot.id}
                            className="text-xs text-purple-800"
                          >
                            {new Date(slot.date).toLocaleDateString()} •{" "}
                            {slot.startTime} - {slot.endTime}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => navigate(`/scheduling/${match.id}`)}
                  >
                    {myAvailabilities.length > 0
                      ? "Update Availability"
                      : "Set Availability"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
