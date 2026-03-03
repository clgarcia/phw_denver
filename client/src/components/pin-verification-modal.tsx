import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

interface PinVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
  registrationType?: "event" | "program" | "trip";
}

export function PinVerificationModal({ 
  open, 
  onOpenChange, 
  onVerified,
  registrationType = "event"
}: PinVerificationModalProps) {
  const { toast } = useToast();
  const [enteredPin, setEnteredPin] = useState("");
  const [isIncorrect, setIsIncorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch the global registration PIN from settings
  const { data: settingsData } = useQuery<{ pin: string }>({
    queryKey: ["/api/settings/registration-pin"],
    enabled: open,
  });

  const globalPin = settingsData?.pin as string | undefined;

  useEffect(() => {
    if (!open) {
      setEnteredPin("");
      setIsIncorrect(false);
    }
  }, [open]);

  const handleVerify = () => {
    if (!globalPin) {
      toast({
        title: "Error",
        description: "PIN is not configured. Please contact the administrator.",
        variant: "destructive",
      });
      return;
    }

    if (enteredPin === globalPin) {
      setIsIncorrect(false);
      onVerified();
      onOpenChange(false);
      setEnteredPin("");
    } else {
      setIsIncorrect(true);
      toast({
        title: "Incorrect PIN",
        description: "The PIN you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && enteredPin) {
      handleVerify();
    }
  };

  const typeLabel = registrationType.charAt(0).toUpperCase() + registrationType.slice(1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registration PIN Required</DialogTitle>
          <DialogDescription>
            Please enter the PIN to proceed with your {registrationType} registration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="pin-input" className="text-sm font-medium">
              Enter PIN
            </label>
            <Input
              id="pin-input"
              type="password"
              placeholder="Enter PIN"
              value={enteredPin}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEnteredPin(e.target.value);
                setIsIncorrect(false);
              }}
              onKeyPress={handleKeyPress}
              disabled={isSubmitting}
              className={isIncorrect ? "border-red-500 focus-visible:ring-red-500" : ""}
              autoFocus
            />
          </div>

          {isIncorrect && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Incorrect PIN. Please try again.</span>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleVerify}
              disabled={!enteredPin || isSubmitting}
            >
              Verify PIN
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
