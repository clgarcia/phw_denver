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
import { Input } from "@/components/ui/input";
import { Users, Search, CheckCircle, Clock, XCircle, Mail } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
function formatDate(dateString) {
    var date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
export default function AdminRegistrations() {
    var _this = this;
    var toast = useToast().toast;
    var _a = useState(""), searchTerm = _a[0], setSearchTerm = _a[1];
    var _b = useQuery({
        queryKey: ["/api/registrations"],
    }), _c = _b.data, registrations = _c === void 0 ? [] : _c, registrationsLoading = _b.isLoading;
    var _d = useQuery({
        queryKey: ["/api/events"],
    }).data, events = _d === void 0 ? [] : _d;
    var _e = useQuery({
        queryKey: ["/api/programs"],
    }).data, programs = _e === void 0 ? [] : _e;
    var updateStatusMutation = useMutation({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var response;
            var id = _b.id, status = _b.status;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, apiRequest("PATCH", "/api/registrations/".concat(id), { status: status })];
                    case 1:
                        response = _c.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/registrations"] });
            toast({ title: "Registration status updated" });
        },
        onError: function (error) {
            toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
        },
    });
    var sortedRegistrations = __spreadArray([], registrations, true).sort(function (a, b) { return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); });
    var filterBySearch = function (regs) {
        if (!searchTerm)
            return regs;
        return regs.filter(function (reg) {
            return reg.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                reg.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                reg.email.toLowerCase().includes(searchTerm.toLowerCase());
        });
    };
    var pendingRegistrations = filterBySearch(sortedRegistrations.filter(function (r) { return r.status === "pending"; }));
    var confirmedRegistrations = filterBySearch(sortedRegistrations.filter(function (r) { return r.status === "confirmed"; }));
    var cancelledRegistrations = filterBySearch(sortedRegistrations.filter(function (r) { return r.status === "cancelled"; }));
    var getEventOrProgramName = function (reg) {
        if (reg.eventId) {
            var event_1 = events.find(function (e) { return e.id === reg.eventId; });
            return (event_1 === null || event_1 === void 0 ? void 0 : event_1.title) || "Unknown Event";
        }
        if (reg.programId) {
            var program = programs.find(function (p) { return p.id === reg.programId; });
            return (program === null || program === void 0 ? void 0 : program.name) || "Unknown Program";
        }
        return "N/A";
    };
    var stats = [
        { label: "Total", value: registrations.length, color: "text-foreground" },
        { label: "Pending", value: registrations.filter(function (r) { return r.status === "pending"; }).length, color: "text-amber-600" },
        { label: "Confirmed", value: registrations.filter(function (r) { return r.status === "confirmed"; }).length, color: "text-green-600" },
        { label: "Cancelled", value: registrations.filter(function (r) { return r.status === "cancelled"; }).length, color: "text-destructive" },
    ];
    var RegistrationTable = function (_a) {
        var data = _a.data, emptyMessage = _a.emptyMessage, testIdPrefix = _a.testIdPrefix;
        if (registrationsLoading) {
            return (<div className="space-y-3">
          {[1, 2, 3].map(function (i) { return (<div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-muted"/>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"/>
                <div className="h-3 bg-muted rounded w-1/3"/>
              </div>
            </div>); })}
        </div>);
        }
        if (data.length === 0) {
            return (<div className="text-center py-8">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2"/>
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>);
        }
        return (<div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Event/Program</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(function (reg) { return (<TableRow key={reg.id} data-testid={"".concat(testIdPrefix, "-row-").concat(reg.id)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {reg.firstName.charAt(0)}{reg.lastName.charAt(0)}
                      </span>
                    </div>
                    <span className="font-medium">{reg.firstName} {reg.lastName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm capitalize">{reg.participationType || "participant"}</span>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="h-3 w-3 text-muted-foreground"/>
                      <span>{reg.email}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{reg.phone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{getEventOrProgramName(reg)}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{formatDate(reg.createdAt)}</span>
                </TableCell>
                <TableCell>
                  <Select value={reg.status} onValueChange={function (status) { return updateStatusMutation.mutate({ id: reg.id, status: status }); }} disabled={updateStatusMutation.isPending}>
                    <SelectTrigger className="w-[130px]" data-testid={"select-status-".concat(reg.id)}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>); })}
          </TableBody>
        </Table>
      </div>);
    };
    return (<div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-admin-registrations-title">Registrations</h1>
        <p className="text-muted-foreground">View and manage all registrations</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(function (stat) { return (<Card key={stat.label}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={"text-2xl font-bold ".concat(stat.color)} data-testid={"stat-registrations-".concat(stat.label.toLowerCase())}>
                {registrationsLoading ? "..." : stat.value}
              </p>
            </CardContent>
          </Card>); })}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
        <Input placeholder="Search by name or email..." className="pl-10" value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} data-testid="input-search-registrations"/>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600"/>
            <div>
              <CardTitle>Pending Registrations</CardTitle>
              <CardDescription>Registrations awaiting review and confirmation</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RegistrationTable data={pendingRegistrations} emptyMessage={searchTerm ? "No matching pending registrations" : "No pending registrations"} testIdPrefix="pending"/>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600"/>
            <div>
              <CardTitle>Confirmed Registrations</CardTitle>
              <CardDescription>Approved and confirmed registrations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RegistrationTable data={confirmedRegistrations} emptyMessage={searchTerm ? "No matching confirmed registrations" : "No confirmed registrations"} testIdPrefix="confirmed"/>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-destructive"/>
            <div>
              <CardTitle>Cancelled Registrations</CardTitle>
              <CardDescription>Cancelled or declined registrations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RegistrationTable data={cancelledRegistrations} emptyMessage={searchTerm ? "No matching cancelled registrations" : "No cancelled registrations"} testIdPrefix="cancelled"/>
        </CardContent>
      </Card>
    </div>);
}
