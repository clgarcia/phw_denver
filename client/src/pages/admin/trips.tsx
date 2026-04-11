import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Navigation, Plus, Pencil, Trash2, Loader2, MapPin } from "lucide-react";
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

  const [destinationAddress, setDestinationAddress] = useState("");
  const [googleFormUrl, setGoogleFormUrl] = useState("");
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    if (editingTrip && editingTrip.imageUrl) {
      setImageUrl(editingTrip.imageUrl);
    } else if (!editingTrip) {
      setImageUrl("");
    }
  }, [editingTrip]);

  useEffect(() => {
    if (editingTrip) {
      // Parse destination address
      try {
        const destData = JSON.parse(editingTrip.destination || "{}");
        setDestinationAddress(destData.address || "");
      } catch {
        setDestinationAddress(editingTrip.destination || "");
      }

      // Set google form URL
      setGoogleFormUrl(editingTrip.googleFormUrl || "");

      // Set trip full status
      setIsFull(editingTrip.isFull || false);

      // Determine which date mode was used and set states accordingly
      if (editingTrip.dateRangeMode) {
        toggleDateRangeMode(true);
        setDateRangeStart(editingTrip.dateRangeStart || "");
        setDateRangeEnd(editingTrip.dateRangeEnd || "");
        setDateRangeStartTime(editingTrip.dateRangeStartTime || "");
        setDateRangeEndTime(editingTrip.dateRangeEndTime || "");
      } else if (editingTrip.additionalDates) {
        toggleMultipleDatesMode(true);
        try {
          const parsed = JSON.parse(editingTrip.additionalDates);
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
      } else if (editingTrip.date) {
        toggleSingleDateMode(true);
        setSingleDate(editingTrip.date || "");
        setSingleDateStartTime(editingTrip.startTime || "");
        setSingleDateEndTime(editingTrip.endTime || "");
      }
    }
  }, [editingTrip]);

  const { data: trips = [], isLoading } = useQuery<Trip[]>({
    queryKey: ["/api/trips"],
  });

  const sortedTrips = [...trips].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : Infinity;
    const dateB = b.date ? new Date(b.date).getTime() : Infinity;
    return dateA - dateB;
  });

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
    
    // Validate destination address
    if (!destinationAddress.trim()) {
      toast({ 
        title: "Missing destination address", 
        description: "Please enter the destination address.",
        variant: "destructive" 
      });
      return;
    }
    
    // Validate that at least one date option is provided
    const hasSingleDate = singleDateMode && singleDate;
    const hasMultipleDates = multipleDatesMode && multipleDates.some(d => d.date && d.date.trim() !== "");
    const hasDateRange = dateRangeMode && dateRangeStart && dateRangeEnd;
    
    if (!hasSingleDate && !hasMultipleDates && !hasDateRange) {
      toast({ 
        title: "Missing date information", 
        description: "Please enable and fill at least one date option (Single Date, Multiple Dates, or Date Range).",
        variant: "destructive" 
      });
      return;
    }
    
    let additionalDatesJson: string | undefined = undefined;
    let date: string | undefined = undefined;
    let endDate: string | undefined = undefined;
    let startTime: string | undefined = undefined;
    let endTime: string | undefined = undefined;
    
    if (singleDateMode) {
      date = singleDate;
      endDate = singleDate;
      startTime = singleDateStartTime && singleDateStartTime.trim() ? singleDateStartTime : undefined;
      endTime = singleDateEndTime && singleDateEndTime.trim() ? singleDateEndTime : undefined;
      additionalDatesJson = undefined;
    } else if (multipleDatesMode) {
      const filteredDates = multipleDates
        .filter(d => d.date.trim() !== "")
        .map(d => ({
          date: d.date,
          startTime: d.startTime || undefined,
          endTime: d.endTime || undefined
        }));
      additionalDatesJson = filteredDates.length > 0 
        ? JSON.stringify(filteredDates)
        : undefined;
      if (filteredDates.length > 0) {
        date = filteredDates[0].date;
        endDate = filteredDates[filteredDates.length - 1].date;
      }
    } else if (dateRangeMode) {
      date = dateRangeStart;
      endDate = dateRangeEnd;
      startTime = dateRangeStartTime && dateRangeStartTime.trim() ? dateRangeStartTime : undefined;
      endTime = dateRangeEndTime && dateRangeEndTime.trim() ? dateRangeEndTime : undefined;
      additionalDatesJson = undefined;
    }
    
    const tripData: InsertTrip = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      date,
      endDate,
      time: undefined,
      startTime,
      endTime,
      destination: JSON.stringify({ address: destinationAddress.trim() }),
      durationDays: parseInt(formData.get("durationDays") as string),
      durationNights: parseInt(formData.get("durationNights") as string),
      difficultyLevel: formData.get("difficultyLevel") as string,
      isActive: formData.get("isActive") === "on",
      isFull,
      imageUrl,
      googleFormUrl: googleFormUrl.trim() ? googleFormUrl.trim() : undefined,
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
            // Reset date mode states
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
            // Reset location and other states
            setDestinationAddress("");
            setGoogleFormUrl("");
            setIsFull(false);
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
                            maxLength="4"
                            placeholder="1430"
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
                            maxLength="4"
                            placeholder="1600"
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
                <Label htmlFor="destinationAddress">Destination Address</Label>
                <Input 
                  id="destinationAddress" 
                  required 
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  data-testid="input-trip-destination-address"
                  placeholder="Full address"
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
                  type="url" 
                  placeholder="https://forms.google.com/..."
                  value={googleFormUrl}
                  onChange={(e) => setGoogleFormUrl(e.target.value)}
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

              <div className="flex items-center gap-2">
                <Switch
                  id="isFull"
                  checked={isFull}
                  onCheckedChange={setIsFull}
                  data-testid="switch-trip-full"
                />
                <Label htmlFor="isFull">Trip Full</Label>
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
                      {trip.destination} • {trip.date ? `${formatDate(trip.date)}${trip.endDate ? ` - ${formatDate(trip.endDate)}` : ''}` : 'Multiple dates'}
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
                    <p className="font-medium">{trip.registeredCount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Status</p>
                    <p className="font-medium">{trip.isFull ? "FULL" : "Open"}</p>
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
