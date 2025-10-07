import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";

const customerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  phone: z.string().trim().min(10, "Invalid phone number").max(15, "Invalid phone number"),
  email: z.string().trim().email("Invalid email").max(255, "Email too long"),
  address: z.string().trim().min(1, "Address is required").max(500, "Address too long"),
  idProofType: z.string().trim().min(1, "ID proof type is required"),
  idProofNumber: z.string().trim().min(1, "ID proof number is required").max(50, "ID proof number too long"),
});

type CustomerFormData = z.infer<typeof customerSchema>;

const NewCustomer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    idProofType: "",
    idProofNumber: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});

  const handleChange = (field: keyof CustomerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const result = customerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CustomerFormData, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof CustomerFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8099/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(result.data),
      });

      if (response.ok) {
        toast.success("Customer created successfully!");
        navigate("/customers");
      } else {
        const errorData = await response.json().catch(() => ({ message: "Failed to create customer" }));
        toast.error(errorData.message || "Failed to create customer");
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/customers")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-foreground">New Customer</h1>
            <p className="text-muted-foreground mt-2">Add a new customer to the system</p>
          </div>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Enter full name"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="Enter email address"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="Enter complete address"
                    rows={3}
                    className={errors.address ? "border-destructive" : ""}
                  />
                  {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                </div>
              </div>
            </div>

            {/* ID Proof */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Identity Proof</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idProofType">ID Proof Type *</Label>
                  <Input
                    id="idProofType"
                    value={formData.idProofType}
                    onChange={(e) => handleChange("idProofType", e.target.value)}
                    placeholder="e.g., Aadhaar, PAN, Passport"
                    className={errors.idProofType ? "border-destructive" : ""}
                  />
                  {errors.idProofType && <p className="text-sm text-destructive">{errors.idProofType}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idProofNumber">ID Proof Number *</Label>
                  <Input
                    id="idProofNumber"
                    value={formData.idProofNumber}
                    onChange={(e) => handleChange("idProofNumber", e.target.value)}
                    placeholder="Enter ID number"
                    className={errors.idProofNumber ? "border-destructive" : ""}
                  />
                  {errors.idProofNumber && <p className="text-sm text-destructive">{errors.idProofNumber}</p>}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Customer"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/customers")}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default NewCustomer;
