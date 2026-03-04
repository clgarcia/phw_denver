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
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function AdminTrips() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [deleteTrip, setDeleteTrip] = useState<Trip | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [additionalDates, setAdditionalDates] = useState<string[]>(["", "", "", "", ""]);
  const [additionalDatesToWithTimes, setAdditionalDatesToWithTimes] = useState<Array<{date: string, startTime: string, endTime: string}>>([
    { date: "", startTime: "", endTime: "" },
    { date: "", startTime: "", endTime: "" },
    { date: "", startTime: "", endTime: "" },
    { date: "", startTime: "", endTime: "" },
    { date: "", startTime: "", endTime: "" },
  ]);
  const [dateRangeMode, setDateRangeMode] = useState(false);
  const [dateRangeStart, setDateRangeStart] = useState("");
  const [dateRangeEnd, setDateRangeEnd] = useState("");
  const [dateRangeStartTime, setDateRangeStartTime] = useState("");
  const [dateRangeEndTime, setDateRangeEndTime] = useState("");
  const [tripStartTime, setTripStartTime] = useState("");
  const [tripEndTime, setTripEndTime] = useState("");
  const [hasCapacityLimit, setHasCapacityLimit] = useState(true);
  const [participantCapacity, setParticipantCapacity] = useState("15");
  const [volunteerCapacity, setVolunteerCapacity] = useState("5");
  const [hasTripCoordinatorCapacityLimit, setHasTripCoordinatorCapacityLimit] = useState(true);
  const [tripCoordinatorCapacityValue, setTripCoordinatorCapacityValue] = useState("2");

  useEffect(() => {
    if (editingTrip && editingTrip.imageUrl) {
      setImageUrl(editingTrip.imageUrl);
    } else if (!editingTrip) {
      setImageUrl("");
    }
  }, [editingTrip]);

  useEffect(() => {
    if (editingTrip && editingTrip.additionalDates) {
      try {
        const parsed = JSON.parse(editingTrip.additionalDates);
        // Handle both old format (array of date strings) and new format (array of {date, startTime, endTime})
        const datesWithTimes = parsed.map((item: any) => {
          if (typeof item === 'string') {
            return { date: item, startTime: "", endTime: "" };
          }
          return {
            date: item.date || "",
            startTime: item.startTime || "",
            endTime: item.endTime || ""
          };
        });
        // Pad with empty slots to always have 5
        while (datesWithTimes.length < 5) {
          datesWithTimes.push({ date: "", startTime: "", endTime: "" });
        }
        setAdditionalDatesToWithTimes(datesWithTimes);
      } catch {
        setAdditionalDatesToWithTimes([
          { date: "", startTime: "", endTime: "" },
          { date: "", startTime: "", endTime: "" },
          { date: "", startTime: "", endTime: "" },
          { date: "", startTime: "", endTime: "" },
          { date: "", startTime: "", endTime: "" },
        ]);
      }
    } else {
      setAdditionalDatesToWithTimes([
        { date: "", startTime: "", endTime: "" },
        { date: "", startTime: "", endTime: "" },
        { date: "", startTime: "", endTime: "" },
        { date: "", startTime: "", endTime: "" },
        { date: "", startTime: "", endTime: "" },
      ]);
    }
    
    // Set date range fields
    if (editingTrip) {
      setDateRangeMode(editingTrip.dateRangeMode || false);
      setDateRangeStart(editingTrip.dateRangeStart || "");
      setDateRangeEnd(editingTrip.dateRangeEnd || "");
      setDateRangeStartTime(editingTrip.dateRangeStartTime || "");
      setDateRangeEndTime(editingTrip.dateRangeEndTime || "");
      setTripStartTime(editingTrip.startTime || "");
      setTripEndTime(editingTrip.endTime || "");
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
      setEditingTrip(null);
      setAdditionalDates(["", "", "", "", ""]);
      setAdditionalDatesToWithTimes([
        { date: "", startTime: "", endTime: "" },
        { date: "", startTime: "", endTime: "" },
        { date: "", startTime: "", endTime: "" },
        { date: "", startTime: "", endTime: "" },
        { date: "", startTime: "", endTime: "" },
      ]);
      setDateRangeMode(false);
      setDateRangeStart("");
      setDateRangeEnd("");
      setDateRangeStartTime("");
      setDateRangeEndTime("");
      setHasCapacityLimit(true);
      setParticipantCapacity("15");
      setVolunteerCapacity("5");
      setHasTripCoordinatorCapacityLimit(true);
      setTripCoordinatorCapacityValue("2");
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
      setAdditionalDates(["", "", "", "", ""]);
      setAdditionalDatesToWithTimes([
        { date: "", startTime: "", endTime: "" },
        { date: "", startTime: "", endTime: "" },
        { date: "", startTime: "", endTime: "" },
        { date: "", startTime: "", endTime: "" },
        { date: "", startTime: "", endTime: "" },
      ]);
      setDateRangeMode(false);
      setDateRangeStart("");
      setDateRangeEnd("");
      setDateRangeStartTime("");
      setDateRangeEndTime("");
      setHasCapacityLimit(true);
      setParticipantCapacity("15");
      setVolunteerCapacity("5");
      setHasTripCoordinatorCapacityLimit(true);
      setTripCoordinatorCapacityValue("2");
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
    
    const date = formData.get("date") as string;
    const endDate = formData.get("endDate") as string;
    
    // Validate that at least one date option is provided
    const hasMainDates = date && date.trim() !== "" && endDate && endDate.trim() !== "";
    const hasAdditionalDates = additionalDatesToWithTimes.some(d => d.date && d.date.trim() !== "");
    const hasDateRange = dateRangeMode && dateRangeStart && dateRangeEnd;
    
    if (!hasMainDates && !hasAdditionalDates && !hasDateRange) {
      toast({ 
        title: "Missing date information", 
        description: "Please enter at least one date using either the main start/end dates, additional dates, or a date range.",
        variant: "destructive" 
      });
      return;
    }
    
    let additionalDatesJson: string | undefined = undefined;
    
    if (dateRangeMode) {
      // Range mode - no additional dates array needed
      additionalDatesJson = undefined;
    } else {
      // Individual dates mode - filter and collect dates with start/end times
      const filteredDates = additionalDatesToWithTimes
        .filter(d => d.date.trim() !== "")
        .map(d => ({
          date: d.date,
          startTime: d.startTime || undefined,
          endTime: d.endTime || undefined
        }));
      additionalDatesJson = filteredDates.length > 0 
        ? JSON.stringify(filteredDates)
        : undefined;
    }
    
    const tripData: InsertTrip = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      date: date || undefined,
      endDate: endDate || undefined,
      time: undefined,
      startTime: tripStartTime && tripStartTime.trim() ? tripStartTime : undefined,
      endTime: tripEndTime && tripEndTime.trim() ? tripEndTime : undefined,
      meetupLocation: formData.get("meetupLocation") as string,
      destination: formData.get("destination") as string,
      capacity: hasCapacityLimit && participantCapacity ? parseInt(participantCapacity) : 999999,
      durationDays: parseInt(formData.get("durationDays") as string),
      durationNights: parseInt(formData.get("durationNights") as string),
      difficultyLevel: formData.get("difficultyLevel") as string,
      tripCoordinatorCapacity: hasTripCoordinatorCapacityLimit && tripCoordinatorCapacityValue ? parseInt(tripCoordinatorCapacityValue) : 999999,
      tripCoordinatorNames: (formData.get("tripCoordinatorNames") as string) || null,
      volunteerCapacity: hasCapacityLimit && volunteerCapacity ? parseInt(volunteerCapacity) : 999999,
      volunteerNames: (formData.get("volunteerNames") as string) || null,
      isActive: formData.get("isActive") === "on",
      imageUrl,
      googleFormUrl: (formData.get("googleFormUrl") as string) || undefined,
      additionalDates: additionalDatesJson,
      dateRangeMode: dateRangeMode || undefined,
      dateRangeStart: dateRangeMode && dateRangeStart ? dateRangeStart : undefined,
      dateRangeEnd: dateRangeMode && dateRangeEnd ? dateRangeEnd : undefined,
      dateRangeStartTime: dateRangeMode && dateRangeStartTime && dateRangeStartTime.trim() ? dateRangeStartTime : undefined,
      dateRangeEndTime: dateRangeMode && dateRangeEndTime && dateRangeEndTime.trim() ? dateRangeEndTime : undefined,
    };

    if (editingTrip) {
      updateMutation.mutate({ id: editingTrip.id, data: tripData });
    } else {
      createMutation.mutate(tripData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight" data-testid="text-admin-trips">Trips</h2>
          <p className="text-muted-foreground">Manage your trips and registrations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false);
            setEditingTrip(null);
            setAdditionalDates(["", "", "", "", ""]);
            setAdditionalDatesToWithTimes([
              { date: "", startTime: "", endTime: "" },
              { date: "", startTime: "", endTime: "" },
              { date: "", startTime: "", endTime: "" },
              { date: "", startTime: "", endTime: "" },
              { date: "", startTime: "", endTime: "" },
            ]);
            setDateRangeMode(false);
            setDateRangeStart("");
            setDateRangeEnd("");
            setDateRangeStartTime("");
            setDateRangeEndTime("");
            setTripStartTime("");
            setTripEndTime("");
            setHasCapacityLimit(true);
            setParticipantCapacity("15");
            setVolunteerCapacity("5");
          } else {
            setDialogOpen(true);
          }
        }}>
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
                  <Label htmlFor="date">Start Date (optional - use if single date range)</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={editingTrip?.date}
                    data-testid="input-trip-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (optional - use if single date range)</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    defaultValue={editingTrip?.endDate}
                    data-testid="input-trip-end-date"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tripStartTime">Start Time (Military)</Label>
                  <Input
                    id="tripStartTime"
                    type="text"
                    pattern="\d{2}:\d{2}"
                    placeholder="HH:mm (e.g., 14:30)"
                    value={tripStartTime}
                    onChange={(e) => setTripStartTime(e.target.value)}
                    data-testid="input-trip-start-time"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tripEndTime">End Time (Military)</Label>
                  <Input
                    id="tripEndTime"
                    type="text"
                    pattern="\d{2}:\d{2}"
                    placeholder="HH:mm (e.g., 16:00)"
                    value={tripEndTime}
                    onChange={(e) => setTripEndTime(e.target.value)}
                    data-testid="input-trip-end-time"
                  />
                </div>
              </div>

              {/* Additional Trip Dates Section */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label>Additional Trip Options</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {dateRangeMode ? "Date Range" : "Individual Dates"}
                    </span>
                    <Switch
                      checked={dateRangeMode}
                      onCheckedChange={setDateRangeMode}
                      data-testid="switch-trip-date-range-mode"
                    />
                  </div>
                </div>

                {dateRangeMode ? (
                  <div className="space-y-3 pt-3">
                    <p className="text-xs text-muted-foreground">
                      Define a date range for repeat trips
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="dateRangeStart">Range Start Date</Label>
                        <Input
                          id="dateRangeStart"
                          type="date"
                          value={dateRangeStart}
                          onChange={(e) => setDateRangeStart(e.target.value)}
                          data-testid="input-trip-date-range-start"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateRangeEnd">Range End Date</Label>
                        <Input
                          id="dateRangeEnd"
                          type="date"
                          value={dateRangeEnd}
                          onChange={(e) => setDateRangeEnd(e.target.value)}
                          data-testid="input-trip-date-range-end"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateRangeStartTime">Start Time (Military)</Label>
                        <Input
                          id="dateRangeStartTime"
                          type="text"
                          pattern="\d{2}:\d{2}"
                          placeholder="HH:mm"
                          value={dateRangeStartTime}
                          onChange={(e) => setDateRangeStartTime(e.target.value)}
                          data-testid="input-trip-date-range-start-time"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateRangeEndTime">End Time (Military)</Label>
                        <Input
                          id="dateRangeEndTime"
                          type="text"
                          pattern="\d{2}:\d{2}"
                          placeholder="HH:mm"
                          value={dateRangeEndTime}
                          onChange={(e) => setDateRangeEndTime(e.target.value)}
                          data-testid="input-trip-date-range-end-time"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-3">
                    <p className="text-xs text-muted-foreground">
                      List up to 5 additional dates (with start/end times) when repeat trips occur. Leave blank to skip.
                    </p>
                    <div className="space-y-2">
                      {additionalDatesToWithTimes.map((item, index) => (
                        <div key={index} className="grid grid-cols-3 gap-2">
                          <Input
                            type="date"
                            value={item.date}
                            onChange={(e) => {
                              const newItems = [...additionalDatesToWithTimes];
                              newItems[index].date = e.target.value;
                              setAdditionalDatesToWithTimes(newItems);
                            }}
                            placeholder={`Date ${index + 1}`}
                            data-testid={`input-trip-additional-date-${index + 1}`}
                          />
                          <Input
                            type="text"
                            pattern="\d{2}:\d{2}"
                            value={item.startTime}
                            onChange={(e) => {
                              const newItems = [...additionalDatesToWithTimes];
                              newItems[index].startTime = e.target.value;
                              setAdditionalDatesToWithTimes(newItems);
                            }}
                            placeholder="Start HH:mm"
                            data-testid={`input-trip-additional-start-time-${index + 1}`}
                          />
                          <Input
                            type="text"
                            pattern="\d{2}:\d{2}"
                            value={item.endTime}
                            onChange={(e) => {
                              const newItems = [...additionalDatesToWithTimes];
                              newItems[index].endTime = e.target.value;
                              setAdditionalDatesToWithTimes(newItems);
                            }}
                            placeholder="End HH:mm"
                            data-testid={`input-trip-additional-end-time-${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

              <div className="flex items-center gap-2">
                <Switch 
                  checked={hasCapacityLimit}
                  onCheckedChange={setHasCapacityLimit}
                  data-testid="switch-trip-capacity-limit"
                />
                <Label>Has Capacity Limit</Label>
              </div>
              {hasCapacityLimit && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="participantCapacity">Participant Capacity</Label>
                    <Input 
                      id="participantCapacity" 
                      type="number" 
                      min="1"
                      value={participantCapacity}
                      onChange={(e) => setParticipantCapacity(e.target.value)}
                      data-testid="input-trip-participant-capacity"
                      placeholder="Enter participant capacity limit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="volunteerCapacity">Volunteer Capacity</Label>
                    <Input 
                      id="volunteerCapacity" 
                      type="number" 
                      min="1"
                      value={volunteerCapacity}
                      onChange={(e) => setVolunteerCapacity(e.target.value)}
                      data-testid="input-trip-volunteer-capacity"
                      placeholder="Enter volunteer capacity limit"
                    />
                  </div>
                </div>
              )}

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

              <div className="flex items-center gap-2">
                <Switch 
                  checked={hasTripCoordinatorCapacityLimit}
                  onCheckedChange={setHasTripCoordinatorCapacityLimit}
                  data-testid="switch-trip-coordinator-capacity-limit"
                />
                <Label>Has Trip Coordinator Capacity Limit</Label>
              </div>

              {hasTripCoordinatorCapacityLimit && (
                <div className="space-y-2">
                  <Label htmlFor="tripCoordinatorCapacity">Trip Coordinator Capacity</Label>
                  <Input
                    id="tripCoordinatorCapacity"
                    type="number"
                    min="1"
                    value={tripCoordinatorCapacityValue}
                    onChange={(e) => setTripCoordinatorCapacityValue(e.target.value)}
                    data-testid="input-trip-coordinator-capacity"
                    placeholder="Enter capacity limit"
                  />
                </div>
              )}

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

              <div className="space-y-2">
                <Label htmlFor="googleFormUrl">Google Form URL (Optional)</Label>
                <Input 
                  id="googleFormUrl" 
                  name="googleFormUrl" 
                  type="url" 
                  placeholder="https://forms.google.com/..."
                  defaultValue={editingTrip?.googleFormUrl || ""}
                  data-testid="input-trip-google-form-url"
                />
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
                        // Set capacity fields
                        setHasCapacityLimit(!!(trip.capacity && trip.capacity !== 999999) || !!(trip.volunteerCapacity && trip.volunteerCapacity !== 999999));
                        setParticipantCapacity(trip.capacity && trip.capacity !== 999999 ? trip.capacity.toString() : "15");
                        setVolunteerCapacity(trip.volunteerCapacity && trip.volunteerCapacity !== 999999 ? trip.volunteerCapacity.toString() : "5");
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
