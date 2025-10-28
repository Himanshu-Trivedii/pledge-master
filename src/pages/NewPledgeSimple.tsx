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
import { formatIndianCurrency } from '@/lib/utils';

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
}

const NewPledgeSimple = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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

  const [calculatedInterestRate, setCalculatedInterestRate] = useState<number>(0);
  const [monthlyInterest, setMonthlyInterest] = useState<number>(0);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        const response = await fetch("http://localhost:8099/api/customers", {
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

  // Calculate interest rate and monthly interest based on amount
  useEffect(() => {
    const amount = parseFloat(formData.amount);
    if (amount > 0) {
      let rate = 0;
      if (amount <= 50000) {
        rate = 3.0;
      } else if (amount <= 100000) {
        rate = 2.5;
      } else {
        rate = 2.0;
      }
      setCalculatedInterestRate(rate);
      // Calculate monthly interest
      setMonthlyInterest((amount * rate) / 100);
    } else {
      setCalculatedInterestRate(0);
      setMonthlyInterest(0);
    }
  }, [formData.amount]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId || !formData.title || !formData.itemType || !formData.weight || !formData.purity || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      
      const pledgeData = {
        customerId: parseInt(formData.customerId),
        title: formData.title,
        description: formData.description,
        itemType: formData.itemType,
        weight: parseFloat(formData.weight),
        purity: formData.purity,
        amount: parseFloat(formData.amount),
        notes: formData.notes,
        status: "ACTIVE",
        pledgeDuration: formData.pledgeDuration,
        deadline: new Date(Date.now() + formData.pledgeDuration * 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await fetch("http://localhost:8099/api/pledges", {
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
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to create pledge");
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
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label htmlFor="customerId">Select Customer *</Label>
              <Select value={formData.customerId} onValueChange={(value) => handleInputChange('customerId', value)}>
                <SelectTrigger>
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
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Pledge Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter pledge title"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter pledge description"
                rows={3}
              />
            </div>

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
                    <SelectItem value="28K">28K</SelectItem>
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
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="Enter loan amount"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Interest Details</Label>
                <div className="p-3 bg-muted rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Rate:</span>
                    <span className="text-lg font-semibold text-gold">
                      {calculatedInterestRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <span className="text-sm text-muted-foreground">Monthly Interest:</span>
                    <span className="text-lg font-semibold text-foreground">
                      {formatIndianCurrency(monthlyInterest, { showCurrency: true, minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                    {formData.amount && (
                      calculatedInterestRate === 3.0 ? "Slab: ₹0 - ₹50,000" :
                      calculatedInterestRate === 2.5 ? "Slab: ₹50,001 - ₹1,00,000" :
                      "Slab: Above ₹1,00,000"
                    )}
                  </p>
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
