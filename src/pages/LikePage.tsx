import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  profilesApi,
  likesApi,
  type CreateLikeDto,
  type Profile,
} from "../lib/api";
import { useCurrentUser } from "../lib/useCurrentUser";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Heart, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { AxiosError } from "axios";

export default function LikePage() {
  const navigate = useNavigate();
  const { userId: currentUserId } = useCurrentUser();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedUserIds, setLikedUserIds] = useState<Set<string>>(new Set());
  const [likingUserId, setLikingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const response = await profilesApi.getProfiles({ limit: 100 });
      setProfiles(response.items);

      // Load sent likes if user is selected
      if (currentUserId) {
        const likesRes = await likesApi.getSent(currentUserId);
        const likedIds = new Set(likesRes.items.map((like) => like.receiverId));
        setLikedUserIds(likedIds);
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || "Failed to load profiles");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (toUserId: string) => {
    if (!currentUserId) {
      alert("Please select a user first from the Profiles page!");
      navigate("/profiles");
      return;
    }

    try {
      setLikingUserId(toUserId);
      setError("");

      const data: CreateLikeDto = {
        senderId: currentUserId,
        receiverId: toUserId,
      };

      const response = await likesApi.create(data);

      // Update liked state
      setLikedUserIds((prev) => new Set([...prev, toUserId]));

      // Show match notification
      if (response.isMatch) {
        alert(`🎉 It's a Match! Match ID: ${response.matchId}`);
        navigate("/matches");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || "Failed to like profile");
    } finally {
      setLikingUserId(null);
    }
  };

  const otherProfiles = profiles.filter((p) => p.id !== currentUserId);

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
        <h1 className="text-3xl font-bold">Find People</h1>
      </div>

      {!currentUserId ? (
        <Card className="mb-6 border-amber-500">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium">No user selected</p>
              <p className="text-sm text-muted-foreground">
                Please go to the Profiles page and click "Use as Me" on any
                profile to continue.
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
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              You are: {profiles.find((p) => p.id === currentUserId)?.name}
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {otherProfiles.map((profile) => {
          const isLiked = likedUserIds.has(profile.id);
          const isLiking = likingUserId === profile.id;

          return (
            <Card key={profile.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                    {profile.name.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{profile.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {profile.age} • {profile.gender}
                    </p>
                    <p className="mt-2 text-sm">{profile.bio}</p>

                    <Button
                      onClick={() => handleLike(profile.id)}
                      disabled={isLiked || isLiking}
                      variant={isLiked ? "secondary" : "default"}
                      className="mt-4 w-full"
                    >
                      {isLiking ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Liking...
                        </>
                      ) : isLiked ? (
                        <>
                          <Heart className="w-4 h-4 mr-2 fill-current" />
                          Liked
                        </>
                      ) : (
                        <>
                          <Heart className="w-4 h-4 mr-2" />
                          Like
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {otherProfiles.length === 0 && !loading && currentUserId && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No other profiles available
          </CardContent>
        </Card>
      )}
    </div>
  );
}
