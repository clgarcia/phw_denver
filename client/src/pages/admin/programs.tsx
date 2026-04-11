import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ClipboardList, Plus, Pencil, Trash2, Loader2, MapPin } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Program, InsertProgram } from "@shared/schema";
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

export default function AdminPrograms() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [deleteProgram, setDeleteProgram] = useState<Program | null>(null);
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

  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [googleFormUrl, setGoogleFormUrl] = useState("");

  // When googleFormUrl changes, automatically enable requiresRegistration if needed
  const handleGoogleFormUrlChange = (value: string) => {
    setGoogleFormUrl(value);
  };
  // Pre-fill imageUrl when editing a program
  useEffect(() => {
    if (editingProgram && editingProgram.imageUrl) {
      setImageUrl(editingProgram.imageUrl);
    } else if (!editingProgram) {
      setImageUrl("");
    }
  }, [editingProgram]);

  const { data: programs = [], isLoading } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
  });

  const sortedPrograms = [...programs].sort((a, b) => {
    const dateA = a.startDate ? new Date(a.startDate).getTime() : Infinity;
    const dateB = b.startDate ? new Date(b.startDate).getTime() : Infinity;
    return dateA - dateB;
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertProgram) => {
      const response = await apiRequest("POST", "/api/programs", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      toast({ title: "Program created successfully" });
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create program", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertProgram> }) => {
      const response = await apiRequest("PATCH", `/api/programs/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      toast({ title: "Program updated successfully" });
      setDialogOpen(false);
      setEditingProgram(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update program", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/programs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      toast({ title: "Program deleted successfully" });
      setDeleteProgram(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete program", description: error.message, variant: "destructive" });
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
    let startDate: string | undefined = undefined;
    let endDate: string | undefined = undefined;
    let startTime: string | undefined = undefined;
    let endTime: string | undefined = undefined;
    
    if (singleDateMode) {
      startDate = singleDate;
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
      // Set start/end dates from first and last date for database
      if (filteredDates.length > 0) {
        startDate = filteredDates[0].date;
        endDate = filteredDates[filteredDates.length - 1].date;
      }
    } else if (dateRangeMode) {
      startDate = dateRangeStart;
      endDate = dateRangeEnd;
      startTime = dateRangeStartTime && dateRangeStartTime.trim() ? dateRangeStartTime : undefined;
      endTime = dateRangeEndTime && dateRangeEndTime.trim() ? dateRangeEndTime : undefined;
      additionalDatesJson = undefined;
    }
    
    const data: InsertProgram = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      location: JSON.stringify({ name: locationName.trim(), address: locationAddress.trim() }),
      startDate,
      endDate,
      schedule: undefined,
      startTime,
      endTime,
      isActive: formData.get("isActive") === "on",
      imageUrl,
      googleFormUrl: googleFormUrl.trim() ? googleFormUrl.trim() : undefined,
      additionalDates: additionalDatesJson,
      dateRangeMode: dateRangeMode || undefined,
      dateRangeStart: dateRangeMode && dateRangeStart ? dateRangeStart : undefined,
      dateRangeEnd: dateRangeMode && dateRangeEnd ? dateRangeEnd : undefined,
      dateRangeStartTime: dateRangeMode && dateRangeStartTime && dateRangeStartTime.trim() ? dateRangeStartTime : undefined,
      dateRangeEndTime: dateRangeMode && dateRangeEndTime && dateRangeEndTime.trim() ? dateRangeEndTime : undefined,
    };
    
    if (editingProgram) {
      updateMutation.mutate({ id: editingProgram.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (program: Program) => {
    setEditingProgram(program);
    
    // Parse location from JSON format
    try {
      const locationData = JSON.parse(program.location || "{}");
      setLocationName(locationData.name || "");
      setLocationAddress(locationData.address || "");
    } catch {
      // Fallback for old format or plain text
      setLocationName(program.location || "");
      setLocationAddress("");
    }
    
    // Set google form URL
    setGoogleFormUrl(program.googleFormUrl || "");
    
    // Determine which date mode was used and set states accordingly
    if (program.dateRangeMode) {
      toggleDateRangeMode(true);
      setDateRangeStart(program.dateRangeStart || "");
      setDateRangeEnd(program.dateRangeEnd || "");
      setDateRangeStartTime(program.dateRangeStartTime || "");
      setDateRangeEndTime(program.dateRangeEndTime || "");
    } else if (program.additionalDates) {
      toggleMultipleDatesMode(true);
      try {
        const parsed = JSON.parse(program.additionalDates);
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
    } else if (program.startDate) {
      toggleSingleDateMode(true);
      setSingleDate(program.startDate || "");
      setSingleDateStartTime(program.startTime || "");
      setSingleDateEndTime(program.endTime || "");
    }
    
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingProgram(null);
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
    setLocationName("");
    setLocationAddress("");
    setGoogleFormUrl("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-admin-programs-title">Programs</h1>
          <p className="text-muted-foreground">Manage your programs</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          if (!open) closeDialog();
          else setDialogOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-program">
              <Plus className="mr-2 h-4 w-4" />
              Create Program
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProgram ? "Edit Program" : "Create New Program"}</DialogTitle>
              <DialogDescription>
                {editingProgram ? "Update the program details below" : "Fill in the details for your new program"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Program Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  required 
                  defaultValue={editingProgram?.name}
                  data-testid="input-program-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  required 
                  defaultValue={editingProgram?.description}
                  data-testid="input-program-description"
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
                <Label htmlFor="locationName">Location Name</Label>
                <Input 
                  id="locationName" 
                  required 
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  data-testid="input-program-location-name"
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
                  data-testid="input-program-location-address"
                  placeholder="e.g., 1234 Cherry St, Denver, CO 80220"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="googleFormUrl">Google Form URL (Optional)</Label>
                <Input 
                  id="googleFormUrl" 
                  type="url" 
                  placeholder="https://forms.google.com/..."
                  value={googleFormUrl}
                  onChange={(e) => handleGoogleFormUrlChange(e.target.value)}
                  data-testid="input-program-google-form-url"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  id="isActive" 
                  name="isActive" 
                  defaultChecked={editingProgram?.isActive ?? true}
                  data-testid="switch-program-active"
                />
                <Label htmlFor="isActive">Active (visible to public)</Label>
              </div>

              <div className="space-y-2 border-t pt-4">
                <Label>Program Image</Label>
                <ImageUpload onUpload={(url: string) => {
                  setImageUrl(url);
                }} setUploading={setImageUploading} />
                {imageUrl && (
                  <div className="pt-2">
                    <span className="text-xs text-muted-foreground">Current Image:</span>
                    <img src={imageUrl} alt="Program" style={{ maxWidth: 200, marginTop: 4 }} />
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
                  data-testid="button-save-program"
                >
                  {(imageUploading || createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingProgram ? "Update Program" : "Create Program"}
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
      ) : sortedPrograms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPrograms.map((program) => (
            <Card key={program.id} data-testid={`card-program-${program.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{program.name}</CardTitle>
                  <Badge variant={program.isActive ? "default" : "secondary"}>
                    {program.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription>{program.startDate ? formatDate(program.startDate) : 'Multiple dates'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{program.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{program.registeredCount}/{program.capacity} enrolled</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => openEditDialog(program)}
                    data-testid={`button-edit-program-${program.id}`}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDeleteProgram(program)}
                    data-testid={`button-delete-program-${program.id}`}
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
          <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No programs yet</h3>
          <p className="text-muted-foreground mb-4">Create your first program to get started</p>
          <Button onClick={() => setDialogOpen(true)} data-testid="button-create-first-program">
            <Plus className="mr-2 h-4 w-4" />
            Create Program
          </Button>
        </Card>
      )}

      <AlertDialog open={!!deleteProgram} onOpenChange={(open) => !open && setDeleteProgram(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Program</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteProgram?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProgram && deleteMutation.mutate(deleteProgram.id)}
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
