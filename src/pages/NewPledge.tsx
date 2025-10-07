import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Calculator } from "lucide-react";
import { z } from "zod";
import CustomerPhotoCapture from "@/components/CustomerPhotoCapture";

const pledgeSchema = z.object({
  customerId: z.number().min(1, "Please select a customer"),
  itemType: z.string().trim().min(1, "Item type is required").max(100, "Item type too long"),
  weight: z.number().min(0.1, "Weight must be at least 0.1g").max(10000, "Weight too high"),
  purity: z.string().trim().min(1, "Purity is required"),
  loanAmount: z.number().min(1, "Loan amount must be at least ₹1").max(10000000, "Loan amount too high"),
  pledgeDuration: z.number().min(1, "Duration must be at least 1 month").max(120, "Duration too long"),
  notes: z.string().trim().max(1000, "Notes too long").optional(),
  customerPhoto: z.string().optional(),
  itemPhoto: z.string().optional(),
  receiptPhoto: z.string().optional(),
});

type PledgeFormData = z.infer<typeof pledgeSchema>;

interface Customer {
  id: number;
  name: string;
  phone: string;
}

const NewPledge = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formData, setFormData] = useState<PledgeFormData>({
    customerId: 0,
    itemType: "",
    weight: 0,
    purity: "",
    loanAmount: 0,
    pledgeDuration: 12,
    notes: "",
    customerPhoto: "",
    itemPhoto: "",
    receiptPhoto: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PledgeFormData, string>>>({});
  const [calculatedInterest, setCalculatedInterest] = useState<{
    rate: number;
    monthlyInterest: number;
    totalInterest: number;
  } | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8099/api/customers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setCustomers(data);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    if (formData.loanAmount > 0 && formData.pledgeDuration > 0) {
      calculateInterest();
    }
  }, [formData.loanAmount, formData.pledgeDuration]);

  const calculateInterest = () => {
    const amount = formData.loanAmount;
    let rate: number;

    // Tiered interest rate structure
    if (amount <= 50000) {
      rate = 3;
    } else if (amount <= 100000) {
      rate = 2.5;
    } else {
      rate = 2;
    }

    const monthlyInterest = (amount * rate) / 100;
    const totalInterest = monthlyInterest * formData.pledgeDuration;

    setCalculatedInterest({
      rate,
      monthlyInterest,
      totalInterest,
    });
  };

  const handleChange = (field: keyof PledgeFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePhotoCapture = (type: 'customer' | 'item' | 'receipt', photoData: string) => {
    setFormData(prev => ({
      ...prev,
      [`${type}Photo`]: photoData
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = pledgeSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof PledgeFormData, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof PledgeFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8099/api/pledges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...result.data,
          interestRate: calculatedInterest?.rate,
        }),
      });

      if (response.ok) {
        toast.success("Pledge created successfully!");
        navigate("/pledges");
      } else {
        const errorData = await response.json().catch(() => ({ message: "Failed to create pledge" }));
        toast.error(errorData.message || "Failed to create pledge");
      }
    } catch (error) {
      toast.error("Connection error. Please check your backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/pledges")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-foreground">New Pledge</h1>
            <p className="text-muted-foreground mt-2">Create a new gold pledge</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Selection */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Customer Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="customerId">Select Customer *</Label>
                  <Select
                    value={formData.customerId.toString()}
                    onValueChange={(value) => handleChange("customerId", parseInt(value))}
                  >
                    <SelectTrigger className={errors.customerId ? "border-destructive" : ""}>
                      <SelectValue placeholder="Choose a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name} - {customer.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.customerId && <p className="text-sm text-destructive">{errors.customerId}</p>}
                </div>
              </div>

              {/* Item Details */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Item Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemType">Item Type *</Label>
                    <Input
                      id="itemType"
                      value={formData.itemType}
                      onChange={(e) => handleChange("itemType", e.target.value)}
                      placeholder="e.g., Gold Necklace, Bangles"
                      className={errors.itemType ? "border-destructive" : ""}
                    />
                    {errors.itemType && <p className="text-sm text-destructive">{errors.itemType}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (grams) *</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={formData.weight || ""}
                      onChange={(e) => handleChange("weight", parseFloat(e.target.value))}
                      placeholder="Enter weight in grams"
                      className={errors.weight ? "border-destructive" : ""}
                    />
                    {errors.weight && <p className="text-sm text-destructive">{errors.weight}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purity">Purity *</Label>
                    <Select
                      value={formData.purity}
                      onValueChange={(value) => handleChange("purity", value)}
                    >
                      <SelectTrigger className={errors.purity ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select purity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24K">24K (99.9% pure)</SelectItem>
                        <SelectItem value="22K">22K (91.6% pure)</SelectItem>
                        <SelectItem value="18K">18K (75% pure)</SelectItem>
                        <SelectItem value="14K">14K (58.5% pure)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.purity && <p className="text-sm text-destructive">{errors.purity}</p>}
                  </div>
                </div>
              </div>

              {/* Loan Details */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Loan Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loanAmount">Loan Amount (₹) *</Label>
                    <Input
                      id="loanAmount"
                      type="number"
                      value={formData.loanAmount || ""}
                      onChange={(e) => handleChange("loanAmount", parseFloat(e.target.value))}
                      placeholder="Enter loan amount"
                      className={errors.loanAmount ? "border-destructive" : ""}
                    />
                    {errors.loanAmount && <p className="text-sm text-destructive">{errors.loanAmount}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pledgeDuration">Duration (months) *</Label>
                    <Input
                      id="pledgeDuration"
                      type="number"
                      value={formData.pledgeDuration || ""}
                      onChange={(e) => handleChange("pledgeDuration", parseInt(e.target.value))}
                      placeholder="Enter duration"
                      className={errors.pledgeDuration ? "border-destructive" : ""}
                    />
                    {errors.pledgeDuration && <p className="text-sm text-destructive">{errors.pledgeDuration}</p>}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                      placeholder="Any additional notes about the pledge"
                      rows={3}
                      className={errors.notes ? "border-destructive" : ""}
                    />
                    {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Pledge"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/pledges")}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>

          {/* Interest Calculator */}
          <Card className="p-6 h-fit sticky top-8">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-gold" />
              <h3 className="text-lg font-semibold text-foreground">Interest Calculator</h3>
            </div>

            {calculatedInterest ? (
              <div className="space-y-4">
                <div className="p-4 bg-gold/10 rounded-lg border border-gold/20">
                  <p className="text-sm text-muted-foreground">Interest Rate</p>
                  <p className="text-3xl font-bold text-gold">{calculatedInterest.rate}%</p>
                  <p className="text-xs text-muted-foreground mt-1">per month</p>
                </div>

                <div className="p-4 bg-secondary rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Monthly Interest</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{calculatedInterest.monthlyInterest.toLocaleString()}
                  </p>
                </div>

                <div className="p-4 bg-secondary rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Total Interest</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{calculatedInterest.totalInterest.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    for {formData.pledgeDuration} months
                  </p>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground">Total Payable</p>
                  <p className="text-2xl font-bold text-primary">
                    ₹{(formData.loanAmount + calculatedInterest.totalInterest).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Enter loan amount and duration to calculate interest
              </p>
            )}
          </Card>
        </div>

        {/* Photo Capture Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-foreground mb-4">Photo Capture</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer Photo</Label>
                <CustomerPhotoCapture
                  onPhotoCapture={(photo) => handlePhotoCapture('customer', photo)}
                />
              </div>

              <div className="space-y-2">
                <Label>Item Photo</Label>
                <CustomerPhotoCapture
                  onPhotoCapture={(photo) => handlePhotoCapture('item', photo)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Receipt Photo</Label>
                <CustomerPhotoCapture
                  onPhotoCapture={(photo) => handlePhotoCapture('receipt', photo)}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default NewPledge;
