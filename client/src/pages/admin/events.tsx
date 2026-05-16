import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar, Plus, Pencil, Trash2, Loader2, MapPin } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Event, InsertEvent } from "@shared/schema";
import { useState, useEffect } from "react";
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
import ImageUpload from "@/components/ui/image-upload";

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getLocationDisplay(location: string): string {
  if (!location) return '';
  try {
    const data = JSON.parse(location);
    return `${data.name}, ${data.address}`;
  } catch {
    // Fallback for old format
    return location;
  }
}

export default function AdminEvents() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteEvent, setDeleteEvent] = useState<Event | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  
  // Pre-fill imageUrl when editing an event
  useEffect(() => {
    if (editingEvent && editingEvent.imageUrl) {
      setImageUrl(editingEvent.imageUrl);
    } else if (!editingEvent) {
      setImageUrl("");
    }
  }, [editingEvent]);

  // Open dialog when we start editing an event
  useEffect(() => {
    if (editingEvent) {
      setDialogOpen(true);
    }
  }, [editingEvent]);

  const [imageUploading, setImageUploading] = useState(false);

  // Date/Time mode states - only ONE mode can be active at a time
  const [singleDateMode, setSingleDateMode] = useState(false);
  const [singleDate, setSingleDate] = useState("");
  const [singleDateStartTime, setSingleDateStartTime] = useState("");
  const [singleDateEndTime, setSingleDateEndTime] = useState("");

  const [multipleDatesMode, setMultipleDatesMode] = useState(false);
  const [multipleDates, setMultipleDates] = useState<Array<{date: string, startTime: string, endTime: string}>>([
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

  // Helper function to toggle modes exclusively
  const toggleSingleDateMode = (value: boolean) => {
    setSingleDateMode(value);
    if (value) {
      setMultipleDatesMode(false);
      setDateRangeMode(false);
    }
  };

  const toggleMultipleDatesMode = (value: boolean) => {
    setMultipleDatesMode(value);
    if (value) {
      setSingleDateMode(false);
      setDateRangeMode(false);
    }
  };

  const toggleDateRangeMode = (value: boolean) => {
    setDateRangeMode(value);
    if (value) {
      setSingleDateMode(false);
      setMultipleDatesMode(false);
    }
  };
  const [requiresRegistration, setRequiresRegistration] = useState(false);
  const [googleFormUrl, setGoogleFormUrl] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");

  // When googleFormUrl changes, automatically enable requiresRegistration
  const handleGoogleFormUrlChange = (value: string) => {
    setGoogleFormUrl(value);
    if (value.trim()) {
      setRequiresRegistration(true);
    }
  };

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const sortedEvents = [...events].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : Infinity;
    const dateB = b.date ? new Date(b.date).getTime() : Infinity;
    return dateA - dateB;
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertEvent) => {
      const response = await apiRequest("POST", "/api/events", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Event created successfully" });
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create event", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertEvent> }) => {
      const response = await apiRequest("PATCH", `/api/events/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Event updated successfully" });
      setDialogOpen(false);
      setEditingEvent(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update event", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Event deleted successfully" });
      setDeleteEvent(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete event", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Validate location fields
    if (!locationName.trim() || !locationAddress.trim()) {
      toast({ 
        title: "Missing location information", 
        description: "Please enter both location name and address.",
        variant: "destructive" 
      });
      return;
    }
    
    // Validate that exactly ONE date mode is active
    const activeModes = [singleDateMode, multipleDatesMode, dateRangeMode].filter(Boolean).length;
    if (activeModes === 0) {
      toast({ 
        title: "Missing date information", 
        description: "Please enable and fill in one of the date options: Single Date, Multiple Dates, or Date Range.",
        variant: "destructive" 
      });
      return;
    }

    // Validate Google Form URL when registration is required
    if (requiresRegistration && !googleFormUrl.trim()) {
      toast({ 
        title: "Missing Google Form URL", 
        description: "Google Form URL is required when registration is enabled.",
        variant: "destructive" 
      });
      return;
    }

    // Prepare data based on active mode
    let eventData: InsertEvent = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      location: JSON.stringify({ name: locationName.trim(), address: locationAddress.trim() }),
      isActive: formData.get("isActive") === "on",
      requiresRegistration: requiresRegistration,
      imageUrl,
      googleFormUrl: googleFormUrl.trim() ? googleFormUrl.trim() : undefined,
      date: undefined,
      time: undefined,
      startTime: undefined,
      endTime: undefined,
      additionalDates: undefined,
      dateRangeMode: undefined,
      dateRangeStart: undefined,
      dateRangeEnd: undefined,
      dateRangeStartTime: undefined,
      dateRangeEndTime: undefined,
    };

    // Populate data based on active mode
    if (singleDateMode) {
      if (!singleDate) {
        toast({ 
          title: "Missing date", 
          description: "Please enter a date for Single Date mode.",
          variant: "destructive" 
        });
        return;
      }
      eventData.date = singleDate;
      eventData.startTime = singleDateStartTime && singleDateStartTime.trim() ? singleDateStartTime : undefined;
      eventData.endTime = singleDateEndTime && singleDateEndTime.trim() ? singleDateEndTime : undefined;
    } else if (multipleDatesMode) {
      const filledDates = multipleDates.filter(d => d.date && d.date.trim() !== "");
      if (filledDates.length === 0) {
        toast({ 
          title: "Missing dates", 
          description: "Please enter at least one date in Multiple Dates mode.",
          variant: "destructive" 
        });
        return;
      }
      eventData.date = filledDates[0].date; // Use first date as the primary date
      eventData.additionalDates = JSON.stringify(filledDates.map(d => ({
        date: d.date,
        startTime: d.startTime || undefined,
        endTime: d.endTime || undefined
      })));
    } else if (dateRangeMode) {
      if (!dateRangeStart || !dateRangeEnd) {
        toast({ 
          title: "Missing dates", 
          description: "Please enter both start and end dates for Date Range mode.",
          variant: "destructive" 
        });
        return;
      }
      eventData.date = dateRangeStart; // Use start date as the primary date
      eventData.dateRangeMode = true;
      eventData.dateRangeStart = dateRangeStart;
      eventData.dateRangeEnd = dateRangeEnd;
      eventData.dateRangeStartTime = dateRangeStartTime && dateRangeStartTime.trim() ? dateRangeStartTime : undefined;
      eventData.dateRangeEndTime = dateRangeEndTime && dateRangeEndTime.trim() ? dateRangeEndTime : undefined;
    }

    console.log("Event form data to submit:", eventData);
    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data: eventData });
    } else {
      createMutation.mutate(eventData);
    }
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    
    // Set capacity fields
    setHasCapacityLimit(!!(event.capacity || event.volunteerCapacity));
    setParticipantCapacity(event.capacity?.toString() || "");
    setVolunteerCapacity(event.volunteerCapacity?.toString() || "");
    setRequiresRegistration(event.requiresRegistration ?? false);
    setGoogleFormUrl(event.googleFormUrl || "");
    setIsFull(event.isFull ?? false);
    
    // Parse location from JSON format
    try {
      const locationData = JSON.parse(event.location);
      setLocationName(locationData.name || "");
      setLocationAddress(locationData.address || "");
    } catch {
      // Fallback for old format or plain text
      setLocationName(event.location || "");
      setLocationAddress("");
    }
    
    // Determine which mode this event uses and load data accordingly
    if (event.dateRangeMode) {
      // Date range mode
      toggleDateRangeMode(true);
      setDateRangeStart(event.dateRangeStart || "");
      setDateRangeEnd(event.dateRangeEnd || "");
      setDateRangeStartTime(event.dateRangeStartTime || "");
      setDateRangeEndTime(event.dateRangeEndTime || "");
    } else if (event.additionalDates) {
      // Multiple dates mode
      toggleMultipleDatesMode(true);
      try {
        const parsed = JSON.parse(event.additionalDates);
        const datesWithTimes = parsed.map((item: any) => {
          if (typeof item === 'string') {
            return { date: item, startTime: "", endTime: "" };
          }
          return {
            date: item.date || "",
            startTime: item.startTime || item.time || "",
            endTime: item.endTime || ""
          };
        });
        // Pad with empty slots to always have 5
        while (datesWithTimes.length < 5) {
          datesWithTimes.push({ date: "", startTime: "", endTime: "" });
        }
        setMultipleDates(datesWithTimes);
      } catch {
        setMultipleDates([
          { date: "", startTime: "", endTime: "" },
          { date: "", startTime: "", endTime: "" },
          { date: "", startTime: "", endTime: "" },
          { date: "", startTime: "", endTime: "" },
          { date: "", startTime: "", endTime: "" },
        ]);
      }
    } else if (event.date) {
      // Single date mode
      toggleSingleDateMode(true);
      setSingleDate(event.date || "");
      setSingleDateStartTime(event.startTime || "");
      setSingleDateEndTime(event.endTime || "");
    }
    
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingEvent(null);
    
    // Reset all date/time mode states
    setSingleDateMode(false);
    setSingleDate("");
    setSingleDateStartTime("");
    setSingleDateEndTime("");
    
    setMultipleDatesMode(false);
    setMultipleDates([
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
    
    setRequiresRegistration(false);
    setGoogleFormUrl("");
    setLocationName("");
    setLocationAddress("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-admin-events-title">Events</h1>
          <p className="text-muted-foreground">Manage your events</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          if (!open) closeDialog();
          else setDialogOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-event">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
              <DialogDescription>
                {editingEvent ? "Update the event details below" : "Fill in the details for your new event"}
              </DialogDescription>
            </DialogHeader>
            <form key={editingEvent?.id || "new"} onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input 
                  id="title" 
                  name="title" 
                  required 
                  defaultValue={editingEvent?.title}
                  data-testid="input-event-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  required 
                  defaultValue={editingEvent?.description}
                  data-testid="input-event-description"
                />
              </div>

              {/* Date and Time Options Section - Only ONE can be active at a time */}
              <div className="space-y-4 border-t pt-4">
                <div className="text-sm font-semibold">Date & Time Options</div>
                <p className="text-xs text-muted-foreground">Enable only one of the following options</p>

                {/* Option 1: Single Date */}
                <div className="space-y-3 rounded border p-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="singleDateToggle"
                      checked={singleDateMode}
                      onCheckedChange={toggleSingleDateMode}
                      data-testid="switch-single-date-mode"
                    />
                    <Label htmlFor="singleDateToggle" className="font-medium">Single Date with Times</Label>
                  </div>
                  
                  {singleDateMode && (
                    <div className="space-y-3 bg-muted/30 rounded p-2 ml-6">
                      <div className="space-y-2">
                        <Label htmlFor="singleDate">Date *</Label>
                        <Input 
                          id="singleDate" 
                          type="date" 
                          value={singleDate}
                          onChange={(e) => setSingleDate(e.target.value)}
                          data-testid="input-single-date"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="singleDateStartTime">Start Time (Military)</Label>
                          <Input 
                            id="singleDateStartTime" 
                            type="text" 
                            pattern="\d{4}" 
                            placeholder="1430"
                            maxLength="4"
                            value={singleDateStartTime}
                            onChange={(e) => setSingleDateStartTime(e.target.value)}
                            data-testid="input-single-date-start-time"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="singleDateEndTime">End Time (Military)</Label>
                          <Input 
                            id="singleDateEndTime" 
                            type="text" 
                            pattern="\d{4}" 
                            placeholder="1600"
                            maxLength="4"
                            value={singleDateEndTime}
                            onChange={(e) => setSingleDateEndTime(e.target.value)}
                            data-testid="input-single-date-end-time"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Option 2: Multiple Dates */}
                <div className="space-y-3 rounded border p-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="multipleDatesToggle"
                      checked={multipleDatesMode}
                      onCheckedChange={toggleMultipleDatesMode}
                      data-testid="switch-multiple-dates-mode"
                    />
                    <Label htmlFor="multipleDatesToggle" className="font-medium">Multiple Dates (up to 5)</Label>
                  </div>
                  
                  {multipleDatesMode && (
                    <div className="space-y-2 bg-muted/30 rounded p-2 ml-6">
                      <p className="text-xs text-muted-foreground">Add up to 5 dates with optional start and end times</p>
                      {multipleDates.map((item, index) => (
                        <div key={index} className="grid grid-cols-3 gap-2">
                          <Input
                            type="date"
                            value={item.date}
                            onChange={(e) => {
                              const newItems = [...multipleDates];
                              newItems[index].date = e.target.value;
                              setMultipleDates(newItems);
                            }}
                            placeholder={`Date ${index + 1}`}
                            data-testid={`input-multiple-date-${index + 1}`}
                          />
                          <Input
                            type="text"
                            pattern="\d{4}"
                            maxLength="4"
                            value={item.startTime}
                            onChange={(e) => {
                              const newItems = [...multipleDates];
                              newItems[index].startTime = e.target.value;
                              setMultipleDates(newItems);
                            }}
                            placeholder="Start 1430"
                            data-testid={`input-multiple-date-start-time-${index + 1}`}
                          />
                          <Input
                            type="text"
                            pattern="\d{4}"
                            maxLength="4"
                            value={item.endTime}
                            onChange={(e) => {
                              const newItems = [...multipleDates];
                              newItems[index].endTime = e.target.value;
                              setMultipleDates(newItems);
                            }}
                            placeholder="End 1600"
                            data-testid={`input-multiple-date-end-time-${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Option 3: Date Range */}
                <div className="space-y-3 rounded border p-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="dateRangeToggle"
                      checked={dateRangeMode}
                      onCheckedChange={toggleDateRangeMode}
                      data-testid="switch-date-range-mode"
                    />
                    <Label htmlFor="dateRangeToggle" className="font-medium">Date Range with Times</Label>
                  </div>
                  
                  {dateRangeMode && (
                    <div className="space-y-3 bg-muted/30 rounded p-2 ml-6">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="dateRangeStart">Start Date *</Label>
                          <Input
                            id="dateRangeStart"
                            type="date"
                            value={dateRangeStart}
                            onChange={(e) => setDateRangeStart(e.target.value)}
                            data-testid="input-date-range-start"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dateRangeEnd">End Date *</Label>
                          <Input
                            id="dateRangeEnd"
                            type="date"
                            value={dateRangeEnd}
                            onChange={(e) => setDateRangeEnd(e.target.value)}
                            data-testid="input-date-range-end"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dateRangeStartTime">Start Time (Military)</Label>
                          <Input
                            id="dateRangeStartTime"
                            type="text"
                            pattern="\d{4}"
                            placeholder="1430"
                            maxLength="4"
                            value={dateRangeStartTime}
                            onChange={(e) => setDateRangeStartTime(e.target.value)}
                            data-testid="input-date-range-start-time"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dateRangeEndTime">End Time (Military)</Label>
                          <Input
                            id="dateRangeEndTime"
                            type="text"
                            pattern="\d{4}"
                            placeholder="1600"
                            maxLength="4"
                            value={dateRangeEndTime}
                            onChange={(e) => setDateRangeEndTime(e.target.value)}
                            data-testid="input-date-range-end-time"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationName">Location Name</Label>
                <Input 
                  id="locationName" 
                  required 
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  data-testid="input-event-location-name"
                  placeholder="e.g., Cherry Creek Park"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationAddress">Address</Label>
                <Input 
                  id="locationAddress" 
                  required 
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  data-testid="input-event-location-address"
                  placeholder="e.g., 1234 Cherry St, Denver, CO 80220"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="googleFormUrl">Google Form URL {requiresRegistration && <span className="text-red-500">*</span>}</Label>
                <Input 
                  id="googleFormUrl" 
                  type="url"
                  value={googleFormUrl}
                  onChange={(e) => handleGoogleFormUrlChange(e.target.value)}
                  data-testid="input-event-google-form-url"
                  placeholder="https://forms.google.com/..."
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  id="isActive" 
                  name="isActive" 
                  defaultChecked={editingEvent?.isActive ?? true}
                  data-testid="switch-event-active"
                />
                <Label htmlFor="isActive">Active (visible to public)</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  id="requiresRegistration" 
                  checked={requiresRegistration}
                  onCheckedChange={(value) => {
                    // If URL exists and they try to turn off registration, prevent it
                    if (googleFormUrl.trim() && !value) {
                      toast({ 
                        title: "Cannot disable registration", 
                        description: "Registration is required when a Google Form URL is provided.",
                        variant: "destructive" 
                      });
                      return;
                    }
                    setRequiresRegistration(value);
                  }}
                  disabled={!!googleFormUrl.trim()}
                  data-testid="switch-event-requires-registration"
                />
                <Label htmlFor="requiresRegistration">Requires Registration {googleFormUrl.trim() && <span className="text-xs text-muted-foreground">(locked - URL provided)</span>}</Label>
              </div>

              <div className="space-y-2">
                <Label>Event Image</Label>
                <ImageUpload onUpload={setImageUrl} setUploading={setImageUploading} />
                {imageUrl && (
                  <div className="pt-2">
                    <span className="text-xs text-muted-foreground">Current Image:</span>
                    <img src={imageUrl} alt="Event" style={{ maxWidth: 200, marginTop: 4 }} />
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={imageUploading || createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-event"
                >
                  {(imageUploading || createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingEvent ? "Update Event" : "Create Event"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedEvents.map((event) => (
            <Card key={event.id} data-testid={`card-event-${event.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <Badge variant={event.isActive ? "default" : "secondary"}>
                    {event.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription>{event.date ? `${formatDate(event.date)}${event.time ? ` at ${event.time}` : ''}` : 'Multiple dates'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{getLocationDisplay(event.location)}</span>
                  </div>
                  {event.capacity && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Participants:</span>
                      <span className="font-medium">{event.registeredCount}/{event.capacity}</span>
                    </div>
                  )}
                  {event.volunteerCapacity && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Volunteers:</span>
                      <span className="font-medium">0/{event.volunteerCapacity}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => openEditDialog(event)}
                    data-testid={`button-edit-event-${event.id}`}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDeleteEvent(event)}
                    data-testid={`button-delete-event-${event.id}`}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events yet</h3>
          <p className="text-muted-foreground mb-4">Create your first event to get started</p>
          <Button onClick={() => setDialogOpen(true)} data-testid="button-create-first-event">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </Card>
      )}

      <AlertDialog open={!!deleteEvent} onOpenChange={(open) => !open && setDeleteEvent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteEvent?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteEvent && deleteMutation.mutate(deleteEvent.id)}
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
