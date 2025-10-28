import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { interestApi } from "@/lib/api";
import { formatIndianCurrency } from "@/lib/utils";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  pledgeId: number;
  currentAmount: number;
  onPaymentSuccess: () => void;
}

export const PaymentModal = ({
  open,
  onClose,
  pledgeId,
  currentAmount,
  onPaymentSuccess,
}: PaymentModalProps) => {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{
    remainingAmount: number;
    newInterestRate: number;
    newMonthlyInterest: number;
  } | null>(null);

  const handleAmountChange = async (value: string) => {
    setPaymentAmount(value);
    
    const amount = parseFloat(value);
    if (amount > 0 && amount <= currentAmount) {
      try {
        const response = await interestApi.handlePartialPayment(currentAmount, amount);
        setPreview(response.data.data);
      } catch (error) {
        // Silently fail - preview is optional
      }
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async () => {
    const amount = parseFloat(paymentAmount);
    
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    
    if (amount > currentAmount) {
      toast.error("Payment amount cannot exceed current amount");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:8099/api/pledges/${pledgeId}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (response.ok) {
        toast.success("Payment recorded successfully!");
        onPaymentSuccess();
        onClose();
        setPaymentAmount("");
        setPreview(null);
      } else {
        const errorData = await response.json();
        console.error("Payment error:", errorData);
        toast.error(errorData.message || errorData.error || "Failed to record payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Error recording payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Enter the payment amount to update the pledge
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="currentAmount">Current Amount</Label>
            <div className="p-3 bg-muted rounded-md">
              <span className="text-lg font-semibold">
                {formatIndianCurrency(currentAmount, { showCurrency: true, minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentAmount">Payment Amount *</Label>
            <Input
              id="paymentAmount"
              type="number"
              step="0.01"
              value={paymentAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="Enter payment amount"
            />
          </div>

          {preview && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-sm mb-2">After Payment:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining Amount:</span>
                  <span className="font-semibold">
                    {formatIndianCurrency(preview.remainingAmount, { showCurrency: true, minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Interest Rate:</span>
                  <span className="font-semibold text-gold">{preview.newInterestRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Monthly Interest:</span>
                  <span className="font-semibold">
                    {formatIndianCurrency(preview.newMonthlyInterest, { showCurrency: true, minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !paymentAmount}>
            {loading ? "Recording..." : "Record Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

