import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Search, CheckCircle, Clock, XCircle, Mail } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Event, Program, Registration } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export default function AdminRegistrations() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: registrations = [], isLoading: registrationsLoading } = useQuery<Registration[]>({
    queryKey: ["/api/registrations"],
  });

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: programs = [] } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/registrations/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registrations"] });
      toast({ title: "Registration status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
    },
  });

  const sortedRegistrations = [...registrations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filterBySearch = (regs: Registration[]) => {
    if (!searchTerm) return regs;
    return regs.filter(reg => 
      reg.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const pendingRegistrations = filterBySearch(sortedRegistrations.filter(r => r.status === "pending"));
  const confirmedRegistrations = filterBySearch(sortedRegistrations.filter(r => r.status === "confirmed"));
  const cancelledRegistrations = filterBySearch(sortedRegistrations.filter(r => r.status === "cancelled"));

  const getEventOrProgramName = (reg: Registration) => {
    if (reg.eventId) {
      const event = events.find(e => e.id === reg.eventId);
      return event?.title || "Unknown Event";
    }
    if (reg.programId) {
      const program = programs.find(p => p.id === reg.programId);
      return program?.name || "Unknown Program";
    }
    return "N/A";
  };

  const stats = [
    { label: "Total", value: registrations.length, color: "text-foreground" },
    { label: "Pending", value: registrations.filter(r => r.status === "pending").length, color: "text-amber-600" },
    { label: "Confirmed", value: registrations.filter(r => r.status === "confirmed").length, color: "text-green-600" },
    { label: "Cancelled", value: registrations.filter(r => r.status === "cancelled").length, color: "text-destructive" },
  ];

  const RegistrationTable = ({ data, emptyMessage, testIdPrefix }: { data: Registration[]; emptyMessage: string; testIdPrefix: string }) => {
    if (registrationsLoading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-8">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
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
            {data.map((reg) => (
              <TableRow key={reg.id} data-testid={`${testIdPrefix}-row-${reg.id}`}>
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
                      <Mail className="h-3 w-3 text-muted-foreground" />
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
                  <Select
                    value={reg.status}
                    onValueChange={(status) => updateStatusMutation.mutate({ id: reg.id, status })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-[130px]" data-testid={`select-status-${reg.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-admin-registrations-title">Registrations</h1>
        <p className="text-muted-foreground">View and manage all registrations</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`} data-testid={`stat-registrations-${stat.label.toLowerCase()}`}>
                {registrationsLoading ? "..." : stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="input-search-registrations"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600" />
            <div>
              <CardTitle>Pending Registrations</CardTitle>
              <CardDescription>Registrations awaiting review and confirmation</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RegistrationTable 
            data={pendingRegistrations} 
            emptyMessage={searchTerm ? "No matching pending registrations" : "No pending registrations"}
            testIdPrefix="pending"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <CardTitle>Confirmed Registrations</CardTitle>
              <CardDescription>Approved and confirmed registrations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RegistrationTable 
            data={confirmedRegistrations} 
            emptyMessage={searchTerm ? "No matching confirmed registrations" : "No confirmed registrations"}
            testIdPrefix="confirmed"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-destructive" />
            <div>
              <CardTitle>Cancelled Registrations</CardTitle>
              <CardDescription>Cancelled or declined registrations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RegistrationTable 
            data={cancelledRegistrations} 
            emptyMessage={searchTerm ? "No matching cancelled registrations" : "No cancelled registrations"}
            testIdPrefix="cancelled"
          />
        </CardContent>
      </Card>
    </div>
  );
}
