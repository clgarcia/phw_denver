import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ClipboardList, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
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
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export default function AdminPrograms() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [deleteProgram, setDeleteProgram] = useState<Program | null>(null);
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
  const [programStartTime, setProgramStartTime] = useState("");
  const [programEndTime, setProgramEndTime] = useState("");
  const [hasCapacityLimit, setHasCapacityLimit] = useState(true);
  const [participantCapacity, setParticipantCapacity] = useState("30");
  const [volunteerCapacity, setVolunteerCapacity] = useState("30");
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

  const sortedPrograms = [...programs].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

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
    console.log("Submitting program with imageUrl:", imageUrl);
    
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
    
    const data: InsertProgram = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      schedule: formData.get("schedule") as string,
      // price removed
      capacity: hasCapacityLimit && participantCapacity ? parseInt(participantCapacity) : undefined,
      volunteerCapacity: hasCapacityLimit && volunteerCapacity ? parseInt(volunteerCapacity) : undefined,
      startTime: programStartTime || undefined,
      endTime: programEndTime || undefined,
      isActive: formData.get("isActive") === "on",
      imageUrl,
      googleFormUrl: (formData.get("googleFormUrl") as string) || undefined,
      additionalDates: additionalDatesJson,
      dateRangeMode: dateRangeMode || undefined,
      dateRangeStart: dateRangeMode ? dateRangeStart : undefined,
      dateRangeEnd: dateRangeMode ? dateRangeEnd : undefined,
      dateRangeStartTime: dateRangeMode ? dateRangeStartTime : undefined,
      dateRangeEndTime: dateRangeMode ? dateRangeEndTime : undefined,
    };
    console.log("Program form data to submit:", data);
    if (editingProgram) {
      updateMutation.mutate({ id: editingProgram.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (program: Program) => {
    setEditingProgram(program);
    
    // Set program start/end times
    setProgramStartTime(program.startTime || "");
    setProgramEndTime(program.endTime || "");
    
    // Set capacity fields
    setHasCapacityLimit(!!(program.capacity || program.volunteerCapacity));
    setParticipantCapacity(program.capacity?.toString() || "30");
    setVolunteerCapacity(program.volunteerCapacity?.toString() || "30");
    
    // Set date range mode
    setDateRangeMode(program.dateRangeMode || false);
    setDateRangeStart(program.dateRangeStart || "");
    setDateRangeEnd(program.dateRangeEnd || "");
    setDateRangeStartTime(program.dateRangeStartTime || "");
    setDateRangeEndTime(program.dateRangeEndTime || "");
    
    // Parse additional dates if they exist
    if (program.additionalDates) {
      try {
        const parsed = JSON.parse(program.additionalDates);
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
    setEditingProgram(null);
    setAdditionalDates(["", "", "", "", ""]);
    setAdditionalDatesToWithTimes([
      { date: "", startTime: "", endTime: "" },
      { date: "", startTime: "", endTime: "" },
      { date: "", startTime: "", endTime: "" },
      { date: "", startTime: "", endTime: "" },
      { date: "", startTime: "", endTime: "" },
    ]);
    setDateRangeMode(false);
    setHasCapacityLimit(true);
    setParticipantCapacity("30");
    setVolunteerCapacity("30");
    setDateRangeStart("");
    setDateRangeEnd("");
    setDateRangeStartTime("");
    setDateRangeEndTime("");
    setProgramStartTime("");
    setProgramEndTime("");
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
              <div className="space-y-2">
                <Label>Program Image</Label>
                {/* Debug: Rendering ImageUpload in programs form. imageUrl is available in state */}
                <ImageUpload onUpload={(url: string) => {
                  // console.log("ImageUpload: received uploaded image URL:", url);
                  setImageUrl(url);
                }} setUploading={setImageUploading} />
                {imageUrl && (
                  <div className="pt-2">
                    <span className="text-xs text-muted-foreground">Current Image:</span>
                    <img src={imageUrl} alt="Program" style={{ maxWidth: 200, marginTop: 4 }} />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input 
                    id="startDate" 
                    name="startDate" 
                    type="date" 
                    required 
                    defaultValue={editingProgram?.startDate}
                    data-testid="input-program-start-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input 
                    id="endDate" 
                    name="endDate" 
                    type="date" 
                    required 
                    defaultValue={editingProgram?.endDate}
                    data-testid="input-program-end-date"
                  />
                </div>
              </div>

              {/* Additional Session Dates Section */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label>Additional Program Options</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {dateRangeMode ? "Date Range" : "Individual Dates"}
                    </span>
                    <Switch
                      checked={dateRangeMode}
                      onCheckedChange={setDateRangeMode}
                      data-testid="switch-program-date-range-mode"
                    />
                  </div>
                </div>

                {dateRangeMode ? (
                  <div className="space-y-3 pt-3">
                    <p className="text-xs text-muted-foreground">
                      Define a date range for this program
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="dateRangeStart">Range Start Date</Label>
                        <Input
                          id="dateRangeStart"
                          type="date"
                          value={dateRangeStart}
                          onChange={(e) => setDateRangeStart(e.target.value)}
                          data-testid="input-program-date-range-start"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateRangeEnd">Range End Date</Label>
                        <Input
                          id="dateRangeEnd"
                          type="date"
                          value={dateRangeEnd}
                          onChange={(e) => setDateRangeEnd(e.target.value)}
                          data-testid="input-program-date-range-end"
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
                          data-testid="input-program-date-range-start-time"
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
                          data-testid="input-program-date-range-end-time"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-3">
                    <p className="text-xs text-muted-foreground">
                      Optionally list up to 5 specific meeting dates with start and end times (military format). Leave blank to skip.
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
                            data-testid={`input-program-additional-date-${index + 1}`}
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
                            data-testid={`input-program-additional-start-time-${index + 1}`}
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
                            data-testid={`input-program-additional-end-time-${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule</Label>
                <Input 
                  id="schedule" 
                  name="schedule" 
                  placeholder="e.g., Mon/Wed/Fri 9am-12pm"
                  required 
                  defaultValue={editingProgram?.schedule}
                  data-testid="input-program-schedule"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="programStartTime">Start Time (Military)</Label>
                  <Input
                    id="programStartTime"
                    type="text"
                    pattern="\d{2}:\d{2}"
                    placeholder="HH:mm (e.g., 14:30)"
                    value={programStartTime}
                    onChange={(e) => setProgramStartTime(e.target.value)}
                    data-testid="input-program-start-time"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="programEndTime">End Time (Military)</Label>
                  <Input
                    id="programEndTime"
                    type="text"
                    pattern="\d{2}:\d{2}"
                    placeholder="HH:mm (e.g., 16:00)"
                    value={programEndTime}
                    onChange={(e) => setProgramEndTime(e.target.value)}
                    data-testid="input-program-end-time"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={hasCapacityLimit}
                  onCheckedChange={setHasCapacityLimit}
                  data-testid="switch-program-capacity-limit"
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
                      data-testid="input-program-participant-capacity"
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
                      data-testid="input-program-volunteer-capacity"
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
                  placeholder="https://forms.google.com/..."
                  defaultValue={editingProgram?.googleFormUrl || ""}
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
                <CardDescription>{formatDate(program.startDate)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{program.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{program.registeredCount}/{program.capacity} enrolled</span>
                </div>
                <p className="text-sm text-muted-foreground">{program.schedule}</p>
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
