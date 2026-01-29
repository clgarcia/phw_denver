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
import { Navigation, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import ImageUpload from "@/components/ui/image-upload";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
function formatDate(dateString) {
    var date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
export default function AdminTrips() {
    var _this = this;
    var _a;
    var toast = useToast().toast;
    var _b = useState(false), dialogOpen = _b[0], setDialogOpen = _b[1];
    var _c = useState(null), editingTrip = _c[0], setEditingTrip = _c[1];
    var _d = useState(null), deleteTrip = _d[0], setDeleteTrip = _d[1];
    var _e = useState(""), imageUrl = _e[0], setImageUrl = _e[1];
    var _f = useState(false), imageUploading = _f[0], setImageUploading = _f[1];
    useEffect(function () {
        if (editingTrip && editingTrip.imageUrl) {
            setImageUrl(editingTrip.imageUrl);
        }
        else if (!editingTrip) {
            setImageUrl("");
        }
    }, [editingTrip]);
    var _g = useQuery({
        queryKey: ["/api/trips"],
    }), _h = _g.data, trips = _h === void 0 ? [] : _h, isLoading = _g.isLoading;
    var sortedTrips = __spreadArray([], trips, true).sort(function (a, b) { return new Date(a.date).getTime() - new Date(b.date).getTime(); });
    var createMutation = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/trips", data)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
            toast({ title: "Trip created successfully" });
            setDialogOpen(false);
        },
        onError: function (error) {
            toast({ title: "Failed to create trip", description: error.message, variant: "destructive" });
        },
    });
    var updateMutation = useMutation({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var response;
            var id = _b.id, data = _b.data;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, apiRequest("PATCH", "/api/trips/".concat(id), data)];
                    case 1:
                        response = _c.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
            toast({ title: "Trip updated successfully" });
            setDialogOpen(false);
            setEditingTrip(null);
        },
        onError: function (error) {
            toast({ title: "Failed to update trip", description: error.message, variant: "destructive" });
        },
    });
    var deleteMutation = useMutation({
        mutationFn: function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("DELETE", "/api/trips/".concat(id))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
            toast({ title: "Trip deleted successfully" });
            setDeleteTrip(null);
        },
        onError: function (error) {
            toast({ title: "Failed to delete trip", description: error.message, variant: "destructive" });
        },
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        var formData = new FormData(e.currentTarget);
        var tripData = {
            name: formData.get("name"),
            description: formData.get("description"),
            date: formData.get("date"),
            endDate: formData.get("endDate"),
            time: formData.get("time"),
            endTime: formData.get("endTime"),
            meetupLocation: formData.get("meetupLocation"),
            destination: formData.get("destination"),
            capacity: parseInt(formData.get("capacity")),
            durationDays: parseInt(formData.get("durationDays")),
            durationNights: parseInt(formData.get("durationNights")),
            difficultyLevel: formData.get("difficultyLevel"),
            tripCoordinatorCapacity: parseInt(formData.get("tripCoordinatorCapacity")),
            tripCoordinatorNames: formData.get("tripCoordinatorNames") || null,
            volunteerCapacity: parseInt(formData.get("volunteerCapacity")),
            volunteerNames: formData.get("volunteerNames") || null,
            isActive: formData.get("isActive") === "on",
            imageUrl: imageUrl,
        };
        if (editingTrip) {
            updateMutation.mutate({ id: editingTrip.id, data: tripData });
        }
        else {
            createMutation.mutate(tripData);
        }
        <div className="space-y-2">
                  <Label>Trip Image</Label>
                  <ImageUpload onUpload={setImageUrl} setUploading={setImageUploading}/>
                  {imageUrl && (<div className="pt-2">
                      <span className="text-xs text-muted-foreground">Current Image:</span>
                      <img src={imageUrl} alt="Trip" style={{ maxWidth: 200, marginTop: 4 }}/>
                    </div>)}
                </div>;
    };
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight" data-testid="text-admin-trips">Trips</h2>
          <p className="text-muted-foreground">Manage your trips and registrations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#c73e1d]/90 hover:bg-[#c73e1d]" onClick={function () { return setEditingTrip(null); }} data-testid="button-new-trip">
              <Plus className="mr-2 h-4 w-4"/>
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
                <Input id="name" name="name" defaultValue={editingTrip === null || editingTrip === void 0 ? void 0 : editingTrip.name} required data-testid="input-trip-name"/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={editingTrip === null || editingTrip === void 0 ? void 0 : editingTrip.description} required data-testid="input-trip-description"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Start Date</Label>
                  <Input id="date" name="date" type="date" defaultValue={editingTrip === null || editingTrip === void 0 ? void 0 : editingTrip.date} required data-testid="input-trip-date"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" name="endDate" type="date" defaultValue={editingTrip === null || editingTrip === void 0 ? void 0 : editingTrip.endDate} required data-testid="input-trip-end-date"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time">Start Time</Label>
                  <Input id="time" name="time" type="time" defaultValue={editingTrip === null || editingTrip === void 0 ? void 0 : editingTrip.time} required data-testid="input-trip-time"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input id="endTime" name="endTime" type="time" defaultValue={editingTrip === null || editingTrip === void 0 ? void 0 : editingTrip.endTime} required data-testid="input-trip-end-time"/>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meetupLocation">Meetup Location</Label>
                <Input id="meetupLocation" name="meetupLocation" defaultValue={editingTrip === null || editingTrip === void 0 ? void 0 : editingTrip.meetupLocation} required data-testid="input-trip-meetup"/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" name="destination" defaultValue={editingTrip === null || editingTrip === void 0 ? void 0 : editingTrip.destination} required data-testid="input-trip-destination"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Total Capacity</Label>
                  <Input id="capacity" name="capacity" type="number" defaultValue={editingTrip === null || editingTrip === void 0 ? void 0 : editingTrip.capacity} required data-testid="input-trip-capacity"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficultyLevel">Difficulty Level</Label>
                  <Input id="difficultyLevel" name="difficultyLevel" placeholder="e.g., Beginner, Intermediate, Advanced" defaultValue={editingTrip === null || editingTrip === void 0 ? void 0 : editingTrip.difficultyLevel} required data-testid="input-trip-difficulty"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="durationDays">Duration (Days)</Label>
                  <Input id="durationDays" name="durationDays" type="number" defaultValue={editingTrip === null || editingTrip === void 0 ? void 0 : editingTrip.durationDays} required data-testid="input-trip-duration-days"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationNights">Duration (Nights)</Label>
                  <Input id="durationNights" name="durationNights" type="number" defaultValue={editingTrip === null || editingTrip === void 0 ? void 0 : editingTrip.durationNights} required data-testid="input-trip-duration-nights"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tripCoordinatorCapacity">Trip Coordinator Capacity</Label>
                  <Input id="tripCoordinatorCapacity" name="tripCoordinatorCapacity" type="number" defaultValue={editingTrip === null || editingTrip === void 0 ? void 0 : editingTrip.tripCoordinatorCapacity} required data-testid="input-trip-coordinator-capacity"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="volunteerCapacity">Volunteer Capacity</Label>
                  <Input id="volunteerCapacity" name="volunteerCapacity" type="number" defaultValue={editingTrip === null || editingTrip === void 0 ? void 0 : editingTrip.volunteerCapacity} required data-testid="input-trip-volunteer-capacity"/>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tripCoordinatorNames">Trip Coordinator Names</Label>
                <Textarea id="tripCoordinatorNames" name="tripCoordinatorNames" placeholder="Enter coordinator names (optional)" defaultValue={(editingTrip === null || editingTrip === void 0 ? void 0 : editingTrip.tripCoordinatorNames) || ""} data-testid="input-trip-coordinator-names"/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="volunteerNames">Volunteer Names</Label>
                <Textarea id="volunteerNames" name="volunteerNames" placeholder="Enter volunteer names (optional)" defaultValue={(editingTrip === null || editingTrip === void 0 ? void 0 : editingTrip.volunteerNames) || ""} data-testid="input-trip-volunteer-names"/>
              </div>

              <div className="space-y-2">
                <Label>Trip Image</Label>
                <ImageUpload onUpload={function (url) { return setImageUrl(url); }} setUploading={setImageUploading}/>
                {imageUrl && (<div className="pt-2">
                    <span className="text-xs text-muted-foreground">Current Image:</span>
                    <img src={imageUrl} alt="Trip" style={{ maxWidth: 200, marginTop: 4 }}/>
                  </div>)}
              </div>

              <div className="flex items-center gap-2">
                <Switch id="isActive" name="isActive" defaultChecked={(_a = editingTrip === null || editingTrip === void 0 ? void 0 : editingTrip.isActive) !== null && _a !== void 0 ? _a : true} data-testid="switch-trip-active"/>
                <Label htmlFor="isActive">Active</Label>
              </div>

              <Button type="submit" className="w-full" disabled={imageUploading || createMutation.isPending || updateMutation.isPending}>
                {(imageUploading || createMutation.isPending || updateMutation.isPending) ? (<>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                    Saving...
                  </>) : (editingTrip ? "Update Trip" : "Create Trip")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (<div className="space-y-2">
          {[1, 2, 3].map(function (i) { return (<Card key={i} className="animate-pulse">
              <div className="h-20 bg-muted rounded"/>
            </Card>); })}
        </div>) : trips.length === 0 ? (<Card className="p-12 text-center">
          <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
          <h3 className="text-lg font-semibold mb-2">No trips yet</h3>
          <p className="text-muted-foreground">Create your first trip to get started</p>
        </Card>) : (<div className="space-y-4">
          {sortedTrips.map(function (trip) { return (<Card key={trip.id}>
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
                    <Button variant="outline" size="sm" onClick={function () {
                    setEditingTrip(trip);
                    setDialogOpen(true);
                }} data-testid={"button-edit-trip-".concat(trip.id)}>
                      <Pencil className="h-4 w-4"/>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={function () { return setDeleteTrip(trip); }} data-testid={"button-delete-trip-".concat(trip.id)}>
                      <Trash2 className="h-4 w-4"/>
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
            </Card>); })}
        </div>)}

      <AlertDialog open={!!deleteTrip} onOpenChange={function () { return setDeleteTrip(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTrip === null || deleteTrip === void 0 ? void 0 : deleteTrip.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={function () { return deleteTrip && deleteMutation.mutate(deleteTrip.id); }} disabled={deleteMutation.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="button-confirm-delete">
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>);
}
