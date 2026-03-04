import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
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
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [hasCapacityLimit, setHasCapacityLimit] = useState(false);
  const [participantCapacity, setParticipantCapacity] = useState("");
  const [volunteerCapacity, setVolunteerCapacity] = useState("");

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
    console.log("Submitting event with imageUrl:", imageUrl);
    const formData = new FormData(e.currentTarget);
    
    const mainDate = formData.get("date") as string;
    
    // Validate that at least one date option is provided
    const hasMainDate = mainDate && mainDate.trim() !== "";
    const hasAdditionalDates = additionalDatesToWithTimes.some(d => d.date && d.date.trim() !== "");
    const hasDateRange = dateRangeMode && dateRangeStart && dateRangeEnd;
    
    if (!hasMainDate && !hasAdditionalDates && !hasDateRange) {
      toast({ 
        title: "Missing date information", 
        description: "Please enter at least one date using either the main date field, additional dates, or a date range.",
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
    
    const data: InsertEvent = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      date: mainDate || undefined,
      time: undefined,
      startTime: eventStartTime && eventStartTime.trim() ? eventStartTime : undefined,
      endTime: eventEndTime && eventEndTime.trim() ? eventEndTime : undefined,
      location: formData.get("location") as string,
      capacity: hasCapacityLimit && participantCapacity ? parseInt(participantCapacity) : undefined,
      volunteerCapacity: hasCapacityLimit && volunteerCapacity ? parseInt(volunteerCapacity) : undefined,
      isActive: formData.get("isActive") === "on",
      requiresRegistration: formData.get("requiresRegistration") === "on",
      imageUrl,
      googleFormUrl: (formData.get("googleFormUrl") as string) || undefined,
      additionalDates: additionalDatesJson,
      dateRangeMode: dateRangeMode || undefined,
      dateRangeStart: dateRangeMode && dateRangeStart ? dateRangeStart : undefined,
      dateRangeEnd: dateRangeMode && dateRangeEnd ? dateRangeEnd : undefined,
      dateRangeStartTime: dateRangeMode && dateRangeStartTime && dateRangeStartTime.trim() ? dateRangeStartTime : undefined,
      dateRangeEndTime: dateRangeMode && dateRangeEndTime && dateRangeEndTime.trim() ? dateRangeEndTime : undefined,
    };

    console.log("Event form data to submit:", data);
    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    
    // Set single date start/end times
    setEventStartTime(event.startTime || "");
    setEventEndTime(event.endTime || "");
    
    // Set capacity fields
    setHasCapacityLimit(!!(event.capacity || event.volunteerCapacity));
    setParticipantCapacity(event.capacity?.toString() || "");
    setVolunteerCapacity(event.volunteerCapacity?.toString() || "");
    
    // Set date range mode
    setDateRangeMode(event.dateRangeMode || false);
    setDateRangeStart(event.dateRangeStart || "");
    setDateRangeEnd(event.dateRangeEnd || "");
    setDateRangeStartTime(event.dateRangeStartTime || "");
    setDateRangeEndTime(event.dateRangeEndTime || "");
    
    // Parse additional dates if they exist
    if (event.additionalDates) {
      try {
        const parsed = JSON.parse(event.additionalDates);
        // Handle multiple formats: old (date strings), v1 ({date, time}), new ({date, startTime, endTime})
        const datesWithTimes = parsed.map((item: any) => {
          if (typeof item === 'string') {
            return { date: item, startTime: "", endTime: "" };
          }
          // Handle both old format with 'time' and new format with 'startTime/endTime'
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
    }
    
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingEvent(null);
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
    setHasCapacityLimit(false);
    setParticipantCapacity("");
    setVolunteerCapacity("");
    setDateRangeEnd("");
    setDateRangeStartTime("");
    setDateRangeEndTime("");
    setEventStartTime("");
    setEventEndTime("");
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
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date (optional - use if single date event)</Label>
                  <Input 
                    id="date" 
                    name="date" 
                    type="date" 
                    defaultValue={editingEvent?.date}
                    data-testid="input-event-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventStartTime">Start Time (Military)</Label>
                  <Input 
                    id="eventStartTime" 
                    type="text" 
                    pattern="\d{2}:\d{2}" 
                    placeholder="HH:mm (e.g., 14:30)"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    data-testid="input-event-start-time"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventEndTime">End Time (Military)</Label>
                  <Input 
                    id="eventEndTime" 
                    type="text" 
                    pattern="\d{2}:\d{2}" 
                    placeholder="HH:mm (e.g., 16:00)"
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    data-testid="input-event-end-time"
                  />
                </div>
              </div>

              {/* Additional Dates Section */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label>Additional Event Options</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {dateRangeMode ? "Date Range" : "Individual Dates"}
                    </span>
                    <Switch
                      checked={dateRangeMode}
                      onCheckedChange={setDateRangeMode}
                      data-testid="switch-event-date-range-mode"
                    />
                  </div>
                </div>

                {dateRangeMode ? (
                  <div className="space-y-3 pt-3">
                    <p className="text-xs text-muted-foreground">
                      Define a date range when this event occurs
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="dateRangeStart">Range Start Date</Label>
                        <Input
                          id="dateRangeStart"
                          type="date"
                          value={dateRangeStart}
                          onChange={(e) => setDateRangeStart(e.target.value)}
                          data-testid="input-event-date-range-start"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateRangeEnd">Range End Date</Label>
                        <Input
                          id="dateRangeEnd"
                          type="date"
                          value={dateRangeEnd}
                          onChange={(e) => setDateRangeEnd(e.target.value)}
                          data-testid="input-event-date-range-end"
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
                          data-testid="input-event-date-range-start-time"
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
                          data-testid="input-event-date-range-end-time"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-3">
                    <p className="text-xs text-muted-foreground">
                      Add up to 5 additional dates with start and end times (military format, optional). Leave blank to skip.
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
                            data-testid={`input-event-additional-date-${index + 1}`}
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
                            data-testid={`input-event-additional-start-time-${index + 1}`}
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
                            data-testid={`input-event-additional-end-time-${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  name="location" 
                  required 
                  defaultValue={editingEvent?.location}
                  data-testid="input-event-location"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={hasCapacityLimit}
                  onCheckedChange={setHasCapacityLimit}
                  data-testid="switch-event-capacity-limit"
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
                      data-testid="input-event-participant-capacity"
                      placeholder="Enter participant capacity"
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
                      data-testid="input-event-volunteer-capacity"
                      placeholder="Enter volunteer capacity"
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="googleFormUrl">Google Form URL (Optional)</Label>
                <Input 
                  id="googleFormUrl" 
                  name="googleFormUrl" 
                  type="url"
                  defaultValue={editingEvent?.googleFormUrl || ""}
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
                  name="requiresRegistration" 
                  defaultChecked={editingEvent?.requiresRegistration ?? true}
                  data-testid="switch-event-requires-registration"
                />
                <Label htmlFor="requiresRegistration">Requires Registration</Label>
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
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{event.location}</span>
                  <span className="font-medium">{event.registeredCount}/{event.capacity}</span>
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
