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
import { ClipboardList, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
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
export default function AdminPrograms() {
    var _this = this;
    var _a;
    var toast = useToast().toast;
    var _b = useState(false), dialogOpen = _b[0], setDialogOpen = _b[1];
    var _c = useState(null), editingProgram = _c[0], setEditingProgram = _c[1];
    var _d = useState(null), deleteProgram = _d[0], setDeleteProgram = _d[1];
    var _e = useState(""), imageUrl = _e[0], setImageUrl = _e[1];
    var _f = useState(false), imageUploading = _f[0], setImageUploading = _f[1];
    // Pre-fill imageUrl when editing a program
    useEffect(function () {
        if (editingProgram && editingProgram.imageUrl) {
            setImageUrl(editingProgram.imageUrl);
        }
        else if (!editingProgram) {
            setImageUrl("");
        }
    }, [editingProgram]);
    var _g = useQuery({
        queryKey: ["/api/programs"],
    }), _h = _g.data, programs = _h === void 0 ? [] : _h, isLoading = _g.isLoading;
    var sortedPrograms = __spreadArray([], programs, true).sort(function (a, b) { return new Date(a.startDate).getTime() - new Date(b.startDate).getTime(); });
    var createMutation = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/programs", data)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
            toast({ title: "Program created successfully" });
            setDialogOpen(false);
        },
        onError: function (error) {
            toast({ title: "Failed to create program", description: error.message, variant: "destructive" });
        },
    });
    var updateMutation = useMutation({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var response;
            var id = _b.id, data = _b.data;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, apiRequest("PATCH", "/api/programs/".concat(id), data)];
                    case 1:
                        response = _c.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
            toast({ title: "Program updated successfully" });
            setDialogOpen(false);
            setEditingProgram(null);
        },
        onError: function (error) {
            toast({ title: "Failed to update program", description: error.message, variant: "destructive" });
        },
    });
    var deleteMutation = useMutation({
        mutationFn: function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("DELETE", "/api/programs/".concat(id))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
            toast({ title: "Program deleted successfully" });
            setDeleteProgram(null);
        },
        onError: function (error) {
            toast({ title: "Failed to delete program", description: error.message, variant: "destructive" });
        },
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        var formData = new FormData(e.currentTarget);
        console.log("Submitting program with imageUrl:", imageUrl);
        var data = {
            name: formData.get("name"),
            description: formData.get("description"),
            startDate: formData.get("startDate"),
            endDate: formData.get("endDate"),
            schedule: formData.get("schedule"),
            // price removed
            capacity: parseInt(formData.get("capacity")) || 30,
            isActive: formData.get("isActive") === "on",
            imageUrl: imageUrl,
        };
        console.log("Program form data to submit:", data);
        if (editingProgram) {
            updateMutation.mutate({ id: editingProgram.id, data: data });
        }
        else {
            createMutation.mutate(data);
        }
    };
    var openEditDialog = function (program) {
        setEditingProgram(program);
        setDialogOpen(true);
    };
    var closeDialog = function () {
        setDialogOpen(false);
        setEditingProgram(null);
    };
    return (<div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-admin-programs-title">Programs</h1>
          <p className="text-muted-foreground">Manage your programs</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={function (open) {
            if (!open)
                closeDialog();
            else
                setDialogOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-program">
              <Plus className="mr-2 h-4 w-4"/>
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
                <Input id="name" name="name" required defaultValue={editingProgram === null || editingProgram === void 0 ? void 0 : editingProgram.name} data-testid="input-program-name"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" required defaultValue={editingProgram === null || editingProgram === void 0 ? void 0 : editingProgram.description} data-testid="input-program-description"/>
              </div>
              <div className="space-y-2">
                <Label>Program Image</Label>
                {/* Debug: Rendering ImageUpload in programs form. imageUrl is available in state */}
                <ImageUpload onUpload={function (url) {
            // console.log("ImageUpload: received uploaded image URL:", url);
            setImageUrl(url);
        }} setUploading={setImageUploading}/>
                {imageUrl && (<div className="pt-2">
                    <span className="text-xs text-muted-foreground">Current Image:</span>
                    <img src={imageUrl} alt="Program" style={{ maxWidth: 200, marginTop: 4 }}/>
                  </div>)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" name="startDate" type="date" required defaultValue={editingProgram === null || editingProgram === void 0 ? void 0 : editingProgram.startDate} data-testid="input-program-start-date"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" name="endDate" type="date" required defaultValue={editingProgram === null || editingProgram === void 0 ? void 0 : editingProgram.endDate} data-testid="input-program-end-date"/>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule</Label>
                <Input id="schedule" name="schedule" placeholder="e.g., Mon/Wed/Fri 9am-12pm" required defaultValue={editingProgram === null || editingProgram === void 0 ? void 0 : editingProgram.schedule} data-testid="input-program-schedule"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" name="capacity" type="number" min="1" required defaultValue={(editingProgram === null || editingProgram === void 0 ? void 0 : editingProgram.capacity) || 30} data-testid="input-program-capacity"/>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="isActive" name="isActive" defaultChecked={(_a = editingProgram === null || editingProgram === void 0 ? void 0 : editingProgram.isActive) !== null && _a !== void 0 ? _a : true} data-testid="switch-program-active"/>
                <Label htmlFor="isActive">Active (visible to public)</Label>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={imageUploading || createMutation.isPending || updateMutation.isPending} data-testid="button-save-program">
                  {(imageUploading || createMutation.isPending || updateMutation.isPending) && (<Loader2 className="mr-2 h-4 w-4 animate-spin"/>)}
                  {editingProgram ? "Update Program" : "Create Program"}
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
        </div>) : sortedPrograms.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPrograms.map(function (program) { return (<Card key={program.id} data-testid={"card-program-".concat(program.id)}>
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
                  <Button variant="outline" size="sm" className="flex-1" onClick={function () { return openEditDialog(program); }} data-testid={"button-edit-program-".concat(program.id)}>
                    <Pencil className="mr-1 h-3 w-3"/>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={function () { return setDeleteProgram(program); }} data-testid={"button-delete-program-".concat(program.id)}>
                    <Trash2 className="h-3 w-3 text-destructive"/>
                  </Button>
                </div>
              </CardContent>
            </Card>); })}
        </div>) : (<Card className="p-12 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
          <h3 className="text-lg font-semibold mb-2">No programs yet</h3>
          <p className="text-muted-foreground mb-4">Create your first program to get started</p>
          <Button onClick={function () { return setDialogOpen(true); }} data-testid="button-create-first-program">
            <Plus className="mr-2 h-4 w-4"/>
            Create Program
          </Button>
        </Card>)}

      <AlertDialog open={!!deleteProgram} onOpenChange={function (open) { return !open && setDeleteProgram(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Program</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteProgram === null || deleteProgram === void 0 ? void 0 : deleteProgram.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={function () { return deleteProgram && deleteMutation.mutate(deleteProgram.id); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="button-confirm-delete">
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>);
}
