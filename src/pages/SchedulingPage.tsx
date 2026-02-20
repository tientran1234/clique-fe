import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  availabilityApi,
  matchesApi,
  type CreateAvailabilityDto,
  type Availability,
} from "../lib/api";
import { useCurrentUser } from "../lib/useCurrentUser";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Loader2, ArrowLeft, Plus, Trash2, AlertCircle } from "lucide-react";
import { AxiosError } from "axios";
import { toast, Toaster } from "sonner";

interface TimeSlot {
  startTime: string;
  endTime: string;
}

export default function SchedulingPage() {
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const { userId: currentUserId } = useCurrentUser();
  const [slots, setSlots] = useState<TimeSlot[]>([
    { startTime: "", endTime: "" },
  ]);
  const [existingAvailabilities, setExistingAvailabilities] = useState<
    Availability[]
  >([]);
  const [loadingAvailabilities, setLoadingAvailabilities] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [validatingMatch, setValidatingMatch] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<string | null>(null);

  useEffect(() => {
    const validateAndLoad = async () => {
      if (!matchId || !currentUserId) {
        setValidatingMatch(false);
        setLoadingAvailabilities(false);
        return;
      }

      try {
        // Validate user belongs to this match
        setValidatingMatch(true);
        const matchResponse = await matchesApi.getAll(currentUserId);
        const match = matchResponse.items.find((m) => m.id === matchId);

        if (!match) {
          toast.error("Match not found or you don't have access to it");
          setTimeout(() => navigate("/matches"), 2000);
          return;
        }

        setValidatingMatch(false);
        await loadExistingAvailabilities();
      } catch {
        setValidatingMatch(false);
        setLoadingAvailabilities(false);
        toast.error("Failed to validate match access");
      }
    };

    validateAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, currentUserId]);

  const loadExistingAvailabilities = async () => {
    if (!matchId || !currentUserId) {
      setLoadingAvailabilities(false);
      return;
    }

    try {
      setLoadingAvailabilities(true);
      console.log("Loading availabilities for matchId:", matchId);
      const response = await availabilityApi.getAll(matchId);
      console.log("All availabilities:", response);
      const myAvailabilities = response.items
        .filter((a) => a.userId === currentUserId)
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
      console.log("My availabilities:", myAvailabilities);
      setExistingAvailabilities(myAvailabilities);
    } catch (err) {
      console.error("Failed to load availabilities:", err);
    } finally {
      setLoadingAvailabilities(false);
    }
  };

  const handleDeleteAvailability = async (id: string) => {
    setSlotToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!slotToDelete) return;

    try {
      setDeleteLoading(true);
      await availabilityApi.delete(slotToDelete);
      setExistingAvailabilities((prev) =>
        prev.filter((a) => a.id !== slotToDelete),
      );
      toast.success("Time slot deleted successfully");
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message || "Failed to delete slot",
      );
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setSlotToDelete(null);
    }
  };

  const handleAddSlot = () => {
    setSlots([...slots, { startTime: "", endTime: "" }]);
  };

  const handleRemoveSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleSlotChange = (
    index: number,
    field: keyof TimeSlot,
    value: string,
  ) => {
    const newSlots = [...slots];
    newSlots[index][field] = value;
    setSlots(newSlots);
  };

  const validateSlots = (slots: TimeSlot[]): string | null => {
    const validSlots = slots.filter((s) => s.startTime && s.endTime);
    if (validSlots.length === 0) {
      return "Please add at least one valid time slot";
    }

    const now = new Date();
    const threeWeeksFromNow = new Date();
    threeWeeksFromNow.setDate(threeWeeksFromNow.getDate() + 21);

    for (const slot of validSlots) {
      const startDate = new Date(slot.startTime);
      const endDate = new Date(slot.endTime);

      // Check valid dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return "Invalid date format detected";
      }

      // Check start time is before end time
      if (startDate >= endDate) {
        return "End time must be after start time";
      }

      // Check minimum duration (1 hour)
      const durationMs = endDate.getTime() - startDate.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      if (durationHours < 1) {
        return "Each time slot must be at least 1 hour long";
      }

      // Check date is not in the past
      if (startDate < now) {
        return "Cannot set availability for past dates";
      }

      // Check date is within 3 weeks
      if (startDate > threeWeeksFromNow) {
        return "Please set availability within the next 3 weeks";
      }
    }

    // Check for overlapping slots
    for (let i = 0; i < validSlots.length; i++) {
      for (let j = i + 1; j < validSlots.length; j++) {
        const start1 = new Date(validSlots[i].startTime);
        const end1 = new Date(validSlots[i].endTime);
        const start2 = new Date(validSlots[j].startTime);
        const end2 = new Date(validSlots[j].endTime);

        if (start1 < end2 && start2 < end1) {
          return "Time slots cannot overlap with each other";
        }
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!matchId) {
      toast.error("Match ID is required");
      return;
    }

    if (!currentUserId) {
      toast.error("User not found. Please go back to the profile page.");
      navigate("/profiles");
      return;
    }

    // Validate slots with comprehensive checks
    const validationError = validateSlots(slots);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const validSlots = slots.filter((s) => s.startTime && s.endTime);

    try {
      setLoading(true);
      const data: CreateAvailabilityDto = {
        userId: currentUserId,
        matchId,
        slots: validSlots.map((slot) => {
          const startDate = new Date(slot.startTime);
          const endDate = new Date(slot.endTime);

          // Validate dates
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new Error("Invalid date format");
          }

          return {
            date: startDate.toISOString(),
            startTime: `${startDate.getHours().toString().padStart(2, "0")}:${startDate.getMinutes().toString().padStart(2, "0")}`,
            endTime: `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`,
          };
        }),
      };

      const response = await availabilityApi.create(data);

      // Reload existing availabilities
      await loadExistingAvailabilities();

      // Reset form
      setSlots([{ startTime: "", endTime: "" }]);

      // If common slot found, show it
      if (response.commonSlot) {
        toast.success(`🎉 ${response.message}`, {
          duration: 4000,
        });
        setTimeout(() => navigate("/matches"), 2000);
      } else {
        toast.success(response.message);
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message || "Failed to set availability",
      );
    } finally {
      setLoading(false);
    }
  };

  // Get minimum datetime (now) for input constraint
  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Get maximum datetime (3 weeks from now)
  const getMaxDateTime = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 21);
    const year = maxDate.getFullYear();
    const month = String(maxDate.getMonth() + 1).padStart(2, "0");
    const day = String(maxDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}T23:59`;
  };

  if (validatingMatch || loadingAvailabilities) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {validatingMatch
              ? "Validating access..."
              : "Loading availabilities..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/matches")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">Set Your Availability</h1>
        </div>

        {/* Explanation Card */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-2">
                  How does scheduling work?
                </p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Choose your free time slots in the next 3 weeks</li>
                  <li>• Your match will also set their availability</li>
                  <li>
                    • The system will automatically find the first overlapping
                    time slot
                  </li>
                  <li>• You'll be notified when a date is scheduled!</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {!currentUserId && (
          <Card className="mb-6 border-amber-500">
            <CardContent className="pt-6 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium">No user selected</p>
                <p className="text-sm text-muted-foreground">
                  Please go to the Profiles page and click "Use as Me" to
                  continue.
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
        )}

        {/* Display existing availabilities */}
        {currentUserId && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Current Availability</CardTitle>
            </CardHeader>
            <CardContent>
              {existingAvailabilities.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No availability slots set yet. Add your available times below.
                </p>
              ) : (
                <div className="space-y-2">
                  {existingAvailabilities.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-md"
                    >
                      <div className="text-sm">
                        <span className="font-medium">
                          {new Date(slot.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="text-muted-foreground mx-2">•</span>
                        <span>
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAvailability(slot.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Add New Time Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {slots.map((slot, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Label htmlFor={`start-${index}`}>Start Time</Label>
                      <Input
                        id={`start-${index}`}
                        type="datetime-local"
                        value={slot.startTime}
                        min={getMinDateTime()}
                        max={getMaxDateTime()}
                        onChange={(e) =>
                          handleSlotChange(index, "startTime", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="flex-1">
                      <Label htmlFor={`end-${index}`}>End Time</Label>
                      <Input
                        id={`end-${index}`}
                        type="datetime-local"
                        value={slot.endTime}
                        min={slot.startTime || getMinDateTime()}
                        max={getMaxDateTime()}
                        onChange={(e) =>
                          handleSlotChange(index, "endTime", e.target.value)
                        }
                        required
                      />
                    </div>

                    {slots.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSlot(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleAddSlot}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Time Slot
              </Button>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Availability"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              💡 Tip: Add multiple time slots to increase the chance of finding
              a common time with your match!
            </p>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Time Slot</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this time slot? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
