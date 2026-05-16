import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminSettings() {
  const { toast } = useToast();
  const [pin, setPin] = useState("");

  const { data: settingsData } = useQuery({
    queryKey: ["/api/settings/registration-pin"],
  });

  useEffect(() => {
    if (settingsData?.pin) {
      setPin(settingsData.pin);
    }
  }, [settingsData]);

  const updatePinMutation = useMutation({
    mutationFn: async (newPin: string) => {
      const response = await apiRequest("POST", "/api/settings/registration-pin", {
        pin: newPin,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/registration-pin"] });
      toast({
        title: "PIN Updated",
        description: "Registration PIN has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update PIN",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pin.trim()) {
      toast({
        title: "Invalid PIN",
        description: "PIN cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    updatePinMutation.mutate(pin);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage global registration settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registration PIN</CardTitle>
          <CardDescription>
            Set a PIN that users must enter to register for events, programs, and trips with Google Forms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="pin">PIN Code</Label>
              <Input
                id="pin"
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="e.g., 1234"
                maxLength={10}
                data-testid="input-registration-pin"
              />
              <p className="text-xs text-muted-foreground">
                Users will be prompted to enter this PIN when registering for events with Google Forms.
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={updatePinMutation.isPending}
                data-testid="button-save-pin"
              >
                {updatePinMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {updatePinMutation.isPending ? "Saving..." : "Save PIN"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Current PIN</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tracking-widest">
            {pin || "Not set"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
