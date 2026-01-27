import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Navigation, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Trip, InsertTrip } from "@shared/schema";
import { useState, useEffect } from "react";
import ImageUpload from "@/components/ui/image-upload";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export default function AdminTrips() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [deleteTrip, setDeleteTrip] = useState<Trip | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (editingTrip && editingTrip.imageUrl) {
      setImageUrl(editingTrip.imageUrl);
    } else if (!editingTrip) {
      setImageUrl("");
    }
  }, [editingTrip]);

  const { data: trips = [], isLoading } = useQuery<Trip[]>({
    queryKey: ["/api/trips"],
  });

  const sortedTrips = [...trips].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const createMutation = useMutation({
    mutationFn: async (data: InsertTrip) => {
      const response = await apiRequest("POST", "/api/trips", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      toast({ title: "Trip created successfully" });
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create trip", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTrip> }) => {
      const response = await apiRequest("PATCH", `/api/trips/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      toast({ title: "Trip updated successfully" });
      setDialogOpen(false);
      setEditingTrip(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update trip", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/trips/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      toast({ title: "Trip deleted successfully" });
      setDeleteTrip(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete trip", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const tripData: InsertTrip = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
      endDate: formData.get("endDate") as string,
      time: formData.get("time") as string,
      endTime: formData.get("endTime") as string,
      meetupLocation: formData.get("meetupLocation") as string,
      destination: formData.get("destination") as string,
      capacity: parseInt(formData.get("capacity") as string),
      durationDays: parseInt(formData.get("durationDays") as string),
      durationNights: parseInt(formData.get("durationNights") as string),
      difficultyLevel: formData.get("difficultyLevel") as string,
      tripCoordinatorCapacity: parseInt(formData.get("tripCoordinatorCapacity") as string),
      tripCoordinatorNames: (formData.get("tripCoordinatorNames") as string) || null,
      volunteerCapacity: parseInt(formData.get("volunteerCapacity") as string),
      volunteerNames: (formData.get("volunteerNames") as string) || null,
      isActive: formData.get("isActive") === "on",
      imageUrl,
    };

    if (editingTrip) {
      updateMutation.mutate({ id: editingTrip.id, data: tripData });
    } else {
      createMutation.mutate(tripData);
    }
                <div className="space-y-2">
                  <Label>Trip Image</Label>
                  <ImageUpload onUpload={setImageUrl} setUploading={setImageUploading} />
                  {imageUrl && (
                    <div className="pt-2">
                      <span className="text-xs text-muted-foreground">Current Image:</span>
                      <img src={imageUrl} alt="Trip" style={{ maxWidth: 200, marginTop: 4 }} />
                    </div>
                  )}
                </div>
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight" data-testid="text-admin-trips">Trips</h2>
          <p className="text-muted-foreground">Manage your trips and registrations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[#c73e1d]/90 hover:bg-[#c73e1d]"
              onClick={() => setEditingTrip(null)}
              data-testid="button-new-trip"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Trip
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTrip ? "Edit Trip" : "Create New Trip"}</DialogTitle>
              <DialogDescription>
                {editingTrip ? "Update trip details" : "Add a new trip for your community"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Trip Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingTrip?.name}
                  required
                  data-testid="input-trip-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingTrip?.description}
                  required
                  data-testid="input-trip-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Start Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={editingTrip?.date}
                    required
                    data-testid="input-trip-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    defaultValue={editingTrip?.endDate}
                    required
                    data-testid="input-trip-end-date"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time">Start Time</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    defaultValue={editingTrip?.time}
                    required
                    data-testid="input-trip-time"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    defaultValue={editingTrip?.endTime}
                    required
                    data-testid="input-trip-end-time"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meetupLocation">Meetup Location</Label>
                <Input
                  id="meetupLocation"
                  name="meetupLocation"
                  defaultValue={editingTrip?.meetupLocation}
                  required
                  data-testid="input-trip-meetup"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  name="destination"
                  defaultValue={editingTrip?.destination}
                  required
                  data-testid="input-trip-destination"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Total Capacity</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    defaultValue={editingTrip?.capacity}
                    required
                    data-testid="input-trip-capacity"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficultyLevel">Difficulty Level</Label>
                  <Input
                    id="difficultyLevel"
                    name="difficultyLevel"
                    placeholder="e.g., Beginner, Intermediate, Advanced"
                    defaultValue={editingTrip?.difficultyLevel}
                    required
                    data-testid="input-trip-difficulty"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="durationDays">Duration (Days)</Label>
                  <Input
                    id="durationDays"
                    name="durationDays"
                    type="number"
                    defaultValue={editingTrip?.durationDays}
                    required
                    data-testid="input-trip-duration-days"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationNights">Duration (Nights)</Label>
                  <Input
                    id="durationNights"
                    name="durationNights"
                    type="number"
                    defaultValue={editingTrip?.durationNights}
                    required
                    data-testid="input-trip-duration-nights"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tripCoordinatorCapacity">Trip Coordinator Capacity</Label>
                  <Input
                    id="tripCoordinatorCapacity"
                    name="tripCoordinatorCapacity"
                    type="number"
                    defaultValue={editingTrip?.tripCoordinatorCapacity}
                    required
                    data-testid="input-trip-coordinator-capacity"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="volunteerCapacity">Volunteer Capacity</Label>
                  <Input
                    id="volunteerCapacity"
                    name="volunteerCapacity"
                    type="number"
                    defaultValue={editingTrip?.volunteerCapacity}
                    required
                    data-testid="input-trip-volunteer-capacity"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tripCoordinatorNames">Trip Coordinator Names</Label>
                <Textarea
                  id="tripCoordinatorNames"
                  name="tripCoordinatorNames"
                  placeholder="Enter coordinator names (optional)"
                  defaultValue={editingTrip?.tripCoordinatorNames || ""}
                  data-testid="input-trip-coordinator-names"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volunteerNames">Volunteer Names</Label>
                <Textarea
                  id="volunteerNames"
                  name="volunteerNames"
                  placeholder="Enter volunteer names (optional)"
                  defaultValue={editingTrip?.volunteerNames || ""}
                  data-testid="input-trip-volunteer-names"
                />
              </div>

              <div className="space-y-2">
                <Label>Trip Image</Label>
                <ImageUpload onUpload={(url: string) => setImageUrl(url)} setUploading={setImageUploading} />
                {imageUrl && (
                  <div className="pt-2">
                    <span className="text-xs text-muted-foreground">Current Image:</span>
                    <img src={imageUrl} alt="Trip" style={{ maxWidth: 200, marginTop: 4 }} />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  name="isActive"
                  defaultChecked={editingTrip?.isActive ?? true}
                  data-testid="switch-trip-active"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={imageUploading || createMutation.isPending || updateMutation.isPending}
              >
                {(imageUploading || createMutation.isPending || updateMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingTrip ? "Update Trip" : "Create Trip"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-20 bg-muted rounded" />
            </Card>
          ))}
        </div>
      ) : trips.length === 0 ? (
        <Card className="p-12 text-center">
          <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No trips yet</h3>
          <p className="text-muted-foreground">Create your first trip to get started</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedTrips.map((trip) => (
            <Card key={trip.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {trip.name}
                      <Badge variant={trip.isActive ? "default" : "secondary"}>
                        {trip.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {trip.destination} • {formatDate(trip.date)} - {formatDate(trip.endDate)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingTrip(trip);
                        setDialogOpen(true);
                      }}
                      data-testid={`button-edit-trip-${trip.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteTrip(trip)}
                      data-testid={`button-delete-trip-${trip.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Duration</p>
                    <p className="font-medium">{trip.durationDays}d / {trip.durationNights}n</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Difficulty</p>
                    <p className="font-medium">{trip.difficultyLevel}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Registrations</p>
                    <p className="font-medium">{trip.registeredCount} / {trip.capacity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Spots Left</p>
                    <p className="font-medium text-primary">{trip.capacity - trip.registeredCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTrip} onOpenChange={() => setDeleteTrip(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTrip?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTrip && deleteMutation.mutate(deleteTrip.id)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
