var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import ImageUpload from "@/components/ui/image-upload";
function formatDate(dateString) {
    var date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
export default function AdminEvents() {
    var _this = this;
    var _a;
    var toast = useToast().toast;
    var _b = useState(false), dialogOpen = _b[0], setDialogOpen = _b[1];
    var _c = useState(null), editingEvent = _c[0], setEditingEvent = _c[1];
    var _d = useState(null), deleteEvent = _d[0], setDeleteEvent = _d[1];
    var _e = useState(""), imageUrl = _e[0], setImageUrl = _e[1];
    // Pre-fill imageUrl when editing an event
    useEffect(function () {
        if (editingEvent && editingEvent.imageUrl) {
            setImageUrl(editingEvent.imageUrl);
        }
        else if (!editingEvent) {
            setImageUrl("");
        }
    }, [editingEvent]);
    var _f = useState(false), imageUploading = _f[0], setImageUploading = _f[1];
    var _g = useQuery({
        queryKey: ["/api/events"],
    }), _h = _g.data, events = _h === void 0 ? [] : _h, isLoading = _g.isLoading;
    var sortedEvents = __spreadArray([], events, true).sort(function (a, b) { return new Date(a.date).getTime() - new Date(b.date).getTime(); });
    var createMutation = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/events", data)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/events"] });
            toast({ title: "Event created successfully" });
            setDialogOpen(false);
        },
        onError: function (error) {
            toast({ title: "Failed to create event", description: error.message, variant: "destructive" });
        },
    });
    var updateMutation = useMutation({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var response;
            var id = _b.id, data = _b.data;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, apiRequest("PATCH", "/api/events/".concat(id), data)];
                    case 1:
                        response = _c.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/events"] });
            toast({ title: "Event updated successfully" });
            setDialogOpen(false);
            setEditingEvent(null);
        },
        onError: function (error) {
            toast({ title: "Failed to update event", description: error.message, variant: "destructive" });
        },
    });
    var deleteMutation = useMutation({
        mutationFn: function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("DELETE", "/api/events/".concat(id))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/events"] });
            toast({ title: "Event deleted successfully" });
            setDeleteEvent(null);
        },
        onError: function (error) {
            toast({ title: "Failed to delete event", description: error.message, variant: "destructive" });
        },
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        console.log("Submitting event with imageUrl:", imageUrl);
        var formData = new FormData(e.currentTarget);
        var data = {
            title: formData.get("title"),
            description: formData.get("description"),
            date: formData.get("date"),
            time: formData.get("time"),
            location: formData.get("location"),
            capacity: parseInt(formData.get("capacity")) || 50,
            isActive: formData.get("isActive") === "on",
            imageUrl: imageUrl,
        };
        console.log("Event form data to submit:", data);
        if (editingEvent) {
            updateMutation.mutate({ id: editingEvent.id, data: data });
        }
        else {
            createMutation.mutate(data);
        }
    };
    var openEditDialog = function (event) {
        setEditingEvent(event);
        setDialogOpen(true);
    };
    var closeDialog = function () {
        setDialogOpen(false);
        setEditingEvent(null);
    };
    return (<div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-admin-events-title">Events</h1>
          <p className="text-muted-foreground">Manage your events</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={function (open) {
            if (!open)
                closeDialog();
            else
                setDialogOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-event">
              <Plus className="mr-2 h-4 w-4"/>
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
                <Input id="title" name="title" required defaultValue={editingEvent === null || editingEvent === void 0 ? void 0 : editingEvent.title} data-testid="input-event-title"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" required defaultValue={editingEvent === null || editingEvent === void 0 ? void 0 : editingEvent.description} data-testid="input-event-description"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" required defaultValue={editingEvent === null || editingEvent === void 0 ? void 0 : editingEvent.date} data-testid="input-event-date"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" name="time" type="time" required defaultValue={editingEvent === null || editingEvent === void 0 ? void 0 : editingEvent.time} data-testid="input-event-time"/>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" required defaultValue={editingEvent === null || editingEvent === void 0 ? void 0 : editingEvent.location} data-testid="input-event-location"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" name="capacity" type="number" min="1" required defaultValue={(editingEvent === null || editingEvent === void 0 ? void 0 : editingEvent.capacity) || 50} data-testid="input-event-capacity"/>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="isActive" name="isActive" defaultChecked={(_a = editingEvent === null || editingEvent === void 0 ? void 0 : editingEvent.isActive) !== null && _a !== void 0 ? _a : true} data-testid="switch-event-active"/>
                <Label htmlFor="isActive">Active (visible to public)</Label>
              </div>
              <div className="space-y-2">
                <Label>Event Image</Label>
                <ImageUpload onUpload={setImageUrl} setUploading={setImageUploading}/>
                {imageUrl && (<div className="pt-2">
                    <span className="text-xs text-muted-foreground">Current Image:</span>
                    <img src={imageUrl} alt="Event" style={{ maxWidth: 200, marginTop: 4 }}/>
                  </div>)}
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={imageUploading || createMutation.isPending || updateMutation.isPending} data-testid="button-save-event">
                  {(imageUploading || createMutation.isPending || updateMutation.isPending) && (<Loader2 className="mr-2 h-4 w-4 animate-spin"/>)}
                  {editingEvent ? "Update Event" : "Create Event"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(function (i) { return (<Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"/>
                <div className="h-4 bg-muted rounded w-1/2 mt-2"/>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"/>
                <div className="h-4 bg-muted rounded w-2/3"/>
              </CardContent>
            </Card>); })}
        </div>) : sortedEvents.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedEvents.map(function (event) { return (<Card key={event.id} data-testid={"card-event-".concat(event.id)}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <Badge variant={event.isActive ? "default" : "secondary"}>
                    {event.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription>{formatDate(event.date)} at {event.time}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{event.location}</span>
                  <span className="font-medium">{event.registeredCount}/{event.capacity}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={function () { return openEditDialog(event); }} data-testid={"button-edit-event-".concat(event.id)}>
                    <Pencil className="mr-1 h-3 w-3"/>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={function () { return setDeleteEvent(event); }} data-testid={"button-delete-event-".concat(event.id)}>
                    <Trash2 className="h-3 w-3 text-destructive"/>
                  </Button>
                </div>
              </CardContent>
            </Card>); })}
        </div>) : (<Card className="p-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
          <h3 className="text-lg font-semibold mb-2">No events yet</h3>
          <p className="text-muted-foreground mb-4">Create your first event to get started</p>
          <Button onClick={function () { return setDialogOpen(true); }} data-testid="button-create-first-event">
            <Plus className="mr-2 h-4 w-4"/>
            Create Event
          </Button>
        </Card>)}

      <AlertDialog open={!!deleteEvent} onOpenChange={function (open) { return !open && setDeleteEvent(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteEvent === null || deleteEvent === void 0 ? void 0 : deleteEvent.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={function () { return deleteEvent && deleteMutation.mutate(deleteEvent.id); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="button-confirm-delete">
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>);
}
