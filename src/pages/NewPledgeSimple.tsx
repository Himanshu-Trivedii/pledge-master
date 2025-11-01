import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { formatIndianCurrency, uploadToCloudinary } from '@/lib/utils';
import { getDefaultInterestRate, setDefaultInterestRate } from '@/lib/config';
import PhotoUpload from '@/components/PhotoUpload.tsx';
import { z } from "zod";
import { getApiUrl } from "@/lib/apiConfig";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
}

const NewPledgeSimple = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayAmount, setDisplayAmount] = useState<string>('');
  
  const [formData, setFormData] = useState({
    customerId: '',
    title: '',
    description: '',
    itemType: '',
    weight: '',
    purity: '',
    amount: '',
    notes: '',
    pledgeDuration: 12
  });

  const [interestRate, setInterestRate] = useState<number>(getDefaultInterestRate(2));
  const [customerPhotoUrl, setCustomerPhotoUrl] = useState<string>('');
  const [itemPhotoUrl, setItemPhotoUrl] = useState<string>('');
  const [receiptPhotoUrl, setReceiptPhotoUrl] = useState<string>('');
  const [monthlyInterest, setMonthlyInterest] = useState<number>(0);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const apiUrl = getApiUrl();

        const response = await fetch(`${apiUrl}/customers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          setCustomers(data.data || []);
        } else {
          setError("Failed to load customers");
        }
      } catch (error) {
        setError("Error loading customers");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomers();
  }, []);

  // Calculate monthly interest based on owner-provided monthly rate
  useEffect(() => {
    const amount = parseFloat(formData.amount);
    const rate = Number.isFinite(interestRate) ? interestRate : 0;
    if (amount > 0 && rate > 0) {
      setMonthlyInterest((amount * rate) / 100);
    } else {
      setMonthlyInterest(0);
    }
  }, [formData.amount, interestRate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate only the fields that are actually required in the simplified form
    if (!formData.customerId || !formData.itemType || !formData.weight || !formData.purity || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const apiUrl = getApiUrl();
      
      // Format deadline as LocalDateTime string without timezone (Spring expects no 'Z')
      const deadlineLocal = new Date(Date.now() + formData.pledgeDuration * 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 19); // e.g., 2025-10-29T12:34:56

      const pledgeData = {
        customerId: parseInt(formData.customerId),
        // Use itemType as title since Title field was removed
        title: (formData.itemType && formData.itemType.trim()) ? formData.itemType.trim() : "Pledge",
        // Backend requires description NotBlank – ensure a sensible fallback
        description: (formData.description && formData.description.trim())
          ? formData.description.trim()
          : `${formData.itemType} - ${parseFloat(formData.weight).toFixed(2)}g ${formData.purity}`,
        itemType: formData.itemType,
        weight: parseFloat(formData.weight),
        purity: formData.purity,
        amount: parseFloat(formData.amount),
        interestRate: interestRate,
        notes: formData.notes,
        status: "ACTIVE",
        pledgeDuration: formData.pledgeDuration,
        deadline: deadlineLocal,
        customerPhoto: customerPhotoUrl || undefined,
        itemPhoto: itemPhotoUrl || undefined,
        receiptPhoto: receiptPhotoUrl || undefined,
      };

      const response = await fetch(`${apiUrl}/pledges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pledgeData),
      });

      if (response.ok) {
        toast.success("Pledge created successfully!");
        navigate("/pledges");
      } else {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          toast.error(errorData.message || "Failed to create pledge");
        } catch {
          toast.error(text || "Failed to create pledge");
        }
      }
    } catch (error) {
      toast.error("Error creating pledge");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading customers...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Create New Pledge</h1>
          <p className="text-muted-foreground mt-2">Fill in the details to create a new pledge</p>
        </div>
        
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}
        
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection with Search */}
            <div className="space-y-2">
              <Label htmlFor="customerId">Select Customer *</Label>
              <Input
                placeholder="Search customer by name"
                className="placeholder:text-foreground placeholder:opacity-90"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
              <Select value={formData.customerId} onValueChange={(value) => handleInputChange('customerId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a customer" />
                </SelectTrigger>
                <SelectContent>
                  {(customers || [])
                    .filter(c => {
                      const q = customerSearch.trim().toLowerCase();
                      if (!q) return true;
                      return c.name.toLowerCase().includes(q) || (c.phone || '').toLowerCase().includes(q);
                    })
                    .map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name} - {customer.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title and Description removed per request; backend-safe fallback is applied on submit */}

            {/* Item Type */}
            <div className="space-y-2">
              <Label htmlFor="itemType">Item Type *</Label>
              <Input
                id="itemType"
                value={formData.itemType}
                onChange={(e) => handleInputChange('itemType', e.target.value)}
                placeholder="e.g., Gold Chain, Gold Ring, etc."
                required
              />
            </div>

            {/* Weight and Purity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (grams) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="Enter weight"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purity">Purity *</Label>
                <Select value={formData.purity} onValueChange={(value) => handleInputChange('purity', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select purity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24K">24K</SelectItem>
                    <SelectItem value="22K">22K</SelectItem>
                    <SelectItem value="18K">18K</SelectItem>
                    <SelectItem value="14K">14K</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amount and Interest Rate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Loan Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  value={displayAmount}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const sanitized = raw.replace(/[^0-9.]/g, '');
                    const [intPart, decPart] = sanitized.split('.');
                    const intNum = intPart ? parseInt(intPart, 10) : NaN;
                    const formattedInt = Number.isNaN(intNum) ? '' : intNum.toLocaleString('en-IN');
                    const display = decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
                    setDisplayAmount(display);
                    const numeric = parseFloat(sanitized);
                    setFormData(prev => ({ ...prev, amount: isFinite(numeric) ? numeric.toString() : '' }));
                  }}
                  placeholder="Enter loan amount"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (%) *</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setInterestRate(Number.isFinite(v) ? v : 0);
                    if (Number.isFinite(v) && v > 0) {
                      setDefaultInterestRate(v);
                    }
                  }}
                  placeholder="Enter interest rate (e.g., 2.0)"
                  required
                />
                <div className="p-3 bg-muted rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estimated Monthly Interest:</span>
                    <span className="text-lg font-semibold text-foreground">
                      {formatIndianCurrency(monthlyInterest, { showCurrency: true, minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pledge Duration */}
            <div className="space-y-2">
              <Label htmlFor="pledgeDuration">Pledge Duration (months)</Label>
              <Select value={formData.pledgeDuration.toString()} onValueChange={(value) => handleInputChange('pledgeDuration', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 6, 12, 18, 24, 36].map((months) => (
                    <SelectItem key={months} value={months.toString()}>
                      {months} months
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Photos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PhotoUpload label="Customer Photo" onPhotoCapture={async (data) => {
                try { const url = await uploadToCloudinary(data, `pledges/${formData.customerId || 'unknown'}`); setCustomerPhotoUrl(url);} catch {


					/* empty */ }
              }} value={customerPhotoUrl} />
              <PhotoUpload label="Jewellery Item Photo" onPhotoCapture={async (data) => {
                try { const url = await uploadToCloudinary(data, `pledges/${formData.customerId || 'unknown'}`); setItemPhotoUrl(url);} catch { /* empty */ }
              }} value={itemPhotoUrl} />
              <PhotoUpload label="Receipt Photo" onPhotoCapture={async (data) => {
                try { const url = await uploadToCloudinary(data, `pledges/${formData.customerId || 'unknown'}`); setReceiptPhotoUrl(url);} catch { /* empty */ }
              }} value={receiptPhotoUrl} />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional notes"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/pledges")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? "Creating..." : "Create Pledge"}
              </Button>
          </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default NewPledgeSimple;
