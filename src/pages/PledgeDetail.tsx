import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Weight, Calendar, User, DollarSign, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PaymentModal } from "@/components/PaymentModal";
import { formatIndianCurrency } from "@/lib/utils";
import { getApiUrl } from "@/lib/apiConfig";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Pledge {
  id: number;
  customerId: number;
  customerName?: string;
  title?: string;
  description?: string;
  itemType?: string;
  weight?: number;
  purity?: string;
  loanAmount?: number; // fallback to amount from API
  amount?: number;
  remainingAmount?: number;
  interestRate: number;
  pledgeDate?: string; // fallback to createdAt
  createdAt?: string;
  lastPaymentDate?: string;
  pledgeDuration?: number;
  status: "ACTIVE" | "COMPLETED" | "DEFAULTED" | "CLOSED" | string;
  notes?: string;
  customerPhoto?: string;
  itemPhoto?: string;
  receiptPhoto?: string;
}

interface Payment {
  id: number;
  pledgeId: number;
  amount: number;
  paymentDate: string;
  paymentType: string;
  notes?: string;
  createdAt: string;
}

const PledgeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pledge, setPledge] = useState<Pledge | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editAmountMode, setEditAmountMode] = useState(false);
  const [editedAmount, setEditedAmount] = useState<number | null>(null);
  const [editRateMode, setEditRateMode] = useState(false);
  const [editedRate, setEditedRate] = useState<number | null>(null);

  useEffect(() => {
    const fetchPledgeData = async () => {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = getApiUrl();
        
        // Fetch pledge data
        const pledgeResponse = await fetch(`${apiUrl}/pledges/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (pledgeResponse.ok) {
          const data = await pledgeResponse.json();
          // Debug: Log the response to see what we're getting
          console.log("Pledge data received:", data);
          console.log("Photo URLs:", {
            customerPhoto: data.customerPhoto,
            itemPhoto: data.itemPhoto,
            receiptPhoto: data.receiptPhoto
          });
          
          // Helper function to validate and clean photo URLs
          const cleanPhotoUrl = (url: string | null | undefined): string | undefined => {
            if (!url) return undefined;
            const cleaned = url.trim();
            return cleaned.length > 0 ? cleaned : undefined;
          };
          
          // Normalize fields for UI
          const normalized: Pledge = {
            ...data,
            loanAmount: data.amount ?? 0,
            remainingAmount: data.remainingAmount ?? data.amount ?? 0,
            itemType: data.itemType ?? data.title ?? "Pledge Item",
            pledgeDate: data.createdAt ?? new Date().toISOString(),
            status: (data.status || "").toString(),
            customerPhoto: cleanPhotoUrl(data.customerPhoto),
            itemPhoto: cleanPhotoUrl(data.itemPhoto),
            receiptPhoto: cleanPhotoUrl(data.receiptPhoto),
          };
          console.log("Normalized pledge with photos:", {
            customerPhoto: normalized.customerPhoto,
            itemPhoto: normalized.itemPhoto,
            receiptPhoto: normalized.receiptPhoto
          });
          setPledge(normalized);
        } else {
          toast.error("Pledge not found");
          navigate("/pledges");
        }

        // Fetch payment history
        const paymentsResponse = await fetch(`${apiUrl}/payments/pledge/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json();
          setPayments(paymentsData.data || []);
        }
      } catch (error) {
        toast.error("Error loading pledge data");
      } finally {
        setLoading(false);
      }
    };

    fetchPledgeData();
  }, [id, navigate]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-success/10 text-success border-success/20";
      case "closed":
      case "completed":
        return "bg-muted text-muted-foreground border-border";
      case "overdue":
      case "defaulted":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const calculateTotals = () => {
    if (!pledge) return { monthlyInterest: 0, totalInterest: 0, totalPayable: 0, amountPaid: 0, balance: 0 };

    // Monthly interest should be computed on original principal, not remainingAmount (which includes interest)
    const principal = pledge.amount ?? 0;
    const monthlyInterest = (principal * (pledge.interestRate ?? 0)) / 100;
    const totalInterest = monthlyInterest * (pledge.pledgeDuration ?? 0);
    const totalPayable = (pledge.amount ?? 0) + totalInterest; // original principal + interest
    
    // Calculate total amount paid from payment history
    const amountPaid = payments.reduce((total, payment) => total + payment.amount, 0);
    const balance = pledge.remainingAmount ?? (pledge.amount ?? 0);

    return { monthlyInterest, totalInterest, totalPayable, amountPaid, balance };
  };


  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading pledge details...</p>
        </div>
      </Layout>
    );
  }

  if (!pledge) {
    return null;
  }

  const totals = calculateTotals();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/pledges")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Pledge #{pledge.id}</h1>
              <p className="text-muted-foreground mt-2">{pledge.itemType}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(pledge.status)}>{pledge.status}</Badge>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive hover:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Pledge</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this pledge? This action cannot be undone and will also delete all associated payments.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem("token");
                        const apiUrl = getApiUrl();
                        const response = await fetch(`${apiUrl}/pledges/${id}`, {
                          method: "DELETE",
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        });

                        if (response.ok) {
                          const result = await response.json();
                          if (result.success) {
                            toast.success("Pledge deleted successfully");
                            navigate("/pledges");
                          } else {
                            toast.error(result.message || "Failed to delete pledge");
                          }
                        } else {
                          const errorData = await response.json().catch(() => ({ message: "Failed to delete pledge" }));
                          toast.error(errorData.message || "Failed to delete pledge");
                        }
                      } catch (error) {
                        toast.error("Error deleting pledge");
                      }
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Main Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Item Details */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Item Details</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-gold mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Item Type</p>
                  <p className="font-medium text-foreground">{pledge.itemType}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Weight className="h-5 w-5 text-gold mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-medium text-foreground">{pledge.weight ?? "-"}g</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-xl text-gold mt-0.5">◆</span>
                <div>
                  <p className="text-sm text-muted-foreground">Purity</p>
                  <p className="font-medium text-gold">{pledge.purity ?? "-"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gold mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Pledge Date</p>
                  <p className="font-medium text-foreground">
                    {new Date(pledge.pledgeDate || pledge.createdAt || new Date().toISOString()).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gold mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-medium"
                    onClick={() => navigate(`/customers/${pledge.customerId}`)}
                  >
                    {pledge.customerName ?? "Customer"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Financial Summary */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Financial Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground">Loan Amount</p>
                {editAmountMode ? (
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <Input
                      type="number"
                      min={1}
                      step="0.01"
                      value={editedAmount ?? pledge.amount ?? 0}
                      onChange={e => setEditedAmount(Number(e.target.value))}
                      className="w-36 sm:w-40"
                    />
                    <div className="flex gap-2">
                      <Button type="button" size="sm" onClick={async () => {
                        setEditAmountMode(false);
                        if (typeof editedAmount === 'number' && editedAmount !== pledge.amount && editedAmount > 0) {
                          try {
                            const token = localStorage.getItem("token");
                            const apiUrl = getApiUrl();
                            // Ensure pledgeDuration is always set
                            const payload = { ...pledge, amount: editedAmount };
                            if (!payload.pledgeDuration) payload.pledgeDuration = 12; // fallback/default if missing
                            const response = await fetch(`${apiUrl}/pledges/${pledge.id}`, {
                              method: "PUT",
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                              },
                              body: JSON.stringify(payload)
                            });
                            if (response.ok) {
                              toast.success("Amount updated");
                              // Refresh pledge
                              const data = await response.json();
                              setPledge(current => ({ ...current!, ...data, amount: data.amount }));
                            } else {
                              const errorText = await response.text();
                              let errorMessage = "Failed to update amount";
                              try {
                                const errorData = JSON.parse(errorText);
                                errorMessage = errorData.message || errorText;
                              } catch {}
                              toast.error(errorMessage);
                            }
                          } catch {
                            toast.error("Network error");
                          }
                        }
                      }}>Save</Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setEditAmountMode(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-2xl font-bold text-primary">{formatIndianCurrency(pledge.amount ?? pledge.loanAmount ?? 0, { showCurrency: true })}</span>
                    <Button variant="outline" size="sm" onClick={() => {
                      setEditAmountMode(true);
                      setEditedAmount(pledge.amount ?? 0);
                    }}>Edit</Button>
                  </div>
                )}
              </div>

              <div className="p-4 bg-gold/10 rounded-lg border border-gold/20">
                <p className="text-sm text-muted-foreground">Interest Rate</p>
                {editRateMode ? (
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <Input
                      type="number"
                      min={0.01}
                      step="0.01"
                      value={editedRate ?? pledge.interestRate ?? 0}
                      onChange={e => setEditedRate(Number(e.target.value))}
                      className="w-32 sm:w-36"
                    />
                    <div className="flex gap-2">
                      <Button type="button" size="sm" onClick={async () => {
                        setEditRateMode(false);
                        if (typeof editedRate === 'number' && editedRate > 0 && editedRate !== pledge.interestRate) {
                          try {
                            const token = localStorage.getItem("token");
                            const apiUrl = getApiUrl();
                            const payload: any = { ...pledge, interestRate: editedRate };
                            if (!payload.pledgeDuration) payload.pledgeDuration = 12;
                            const response = await fetch(`${apiUrl}/pledges/${pledge.id}`, {
                              method: "PUT",
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                              },
                              body: JSON.stringify(payload)
                            });
                            if (response.ok) {
                              const data = await response.json();
                              toast.success("Interest rate updated");
                              setPledge(current => ({ ...current!, ...data }));
                            } else {
                              const errorText = await response.text();
                              let errorMessage = "Failed to update interest";
                              try {
                                const errorData = JSON.parse(errorText);
                                errorMessage = errorData.message || errorText;
                              } catch {}
                              toast.error(errorMessage);
                            }
                          } catch {
                            toast.error("Network error");
                          }
                        }
                      }}>Save</Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setEditRateMode(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-2xl font-bold text-gold">{(pledge.interestRate ?? 0).toFixed(2)}%</p>
                    <Button variant="outline" size="sm" onClick={() => { setEditRateMode(true); setEditedRate(pledge.interestRate ?? 0); }}>Edit</Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">monthly</p>
              </div>

              <div className="p-4 bg-secondary rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-2xl font-bold text-foreground">{pledge.pledgeDuration ?? "-"}</p>
                <p className="text-xs text-muted-foreground mt-1">months</p>
              </div>

              <div className="p-4 bg-secondary rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Monthly Interest</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatIndianCurrency(totals.monthlyInterest, { showCurrency: true, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="p-4 bg-success/10 rounded-lg border border-success/20 md:col-span-2">
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="text-3xl font-bold text-success">
                  {formatIndianCurrency(totals.amountPaid, { showCurrency: true })}
                </p>
              </div>

              <div className="p-4 bg-warning/10 rounded-lg border border-warning/20 md:col-span-2">
                <p className="text-sm text-muted-foreground">Remaining Principal</p>
                <p className="text-3xl font-bold text-warning">
                  {formatIndianCurrency(pledge.remainingAmount ?? 0, { showCurrency: true })}
                </p>
              </div>
            </div>

            {pledge.notes && (
              <div className="mt-4 p-4 bg-secondary rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-foreground">{pledge.notes}</p>
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <Button onClick={() => setShowPaymentModal(true)}>
                <DollarSign className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            </div>
          </Card>
        </div>

        {/* Photos */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-foreground">Photos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer Photo */}
            <div className="flex flex-col items-center">
              {pledge.customerPhoto && pledge.customerPhoto.trim() ? (
                <img 
                  src={pledge.customerPhoto} 
                  alt="Customer" 
                  className="w-full h-48 object-cover rounded mb-2"
                  onError={(e) => {
                    console.error("Error loading customer photo:", pledge.customerPhoto);
                    // Replace broken image with placeholder
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      e.currentTarget.style.display = 'none';
                      const placeholder = document.createElement('div');
                      placeholder.className = 'w-full h-48 bg-secondary flex items-center justify-center rounded text-muted-foreground mb-2';
                      placeholder.textContent = 'No Customer Photo';
                      parent.insertBefore(placeholder, e.currentTarget);
                    }
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-secondary flex items-center justify-center rounded text-muted-foreground mb-2">
                  No Customer Photo
                </div>
              )}
              <div className="text-center font-medium">Customer Photo</div>
            </div>
            {/* Item Photo */}
            <div className="flex flex-col items-center">
              {pledge.itemPhoto && pledge.itemPhoto.trim() ? (
                <img 
                  src={pledge.itemPhoto} 
                  alt="Item" 
                  className="w-full h-48 object-cover rounded mb-2"
                  onError={(e) => {
                    console.error("Error loading item photo:", pledge.itemPhoto);
                    // Replace broken image with placeholder
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      e.currentTarget.style.display = 'none';
                      const placeholder = document.createElement('div');
                      placeholder.className = 'w-full h-48 bg-secondary flex items-center justify-center rounded text-muted-foreground mb-2';
                      placeholder.textContent = 'No Item Photo';
                      parent.insertBefore(placeholder, e.currentTarget);
                    }
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-secondary flex items-center justify-center rounded text-muted-foreground mb-2">
                  No Item Photo
                </div>
              )}
              <div className="text-center font-medium">Item Photo</div>
            </div>
            {/* Receipt Photo */}
            <div className="flex flex-col items-center">
              {pledge.receiptPhoto && pledge.receiptPhoto.trim() ? (
                <img 
                  src={pledge.receiptPhoto} 
                  alt="Receipt" 
                  className="w-full h-48 object-cover rounded mb-2"
                  onError={(e) => {
                    console.error("Error loading receipt photo:", pledge.receiptPhoto);
                    // Replace broken image with placeholder
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      e.currentTarget.style.display = 'none';
                      const placeholder = document.createElement('div');
                      placeholder.className = 'w-full h-48 bg-secondary flex items-center justify-center rounded text-muted-foreground mb-2';
                      placeholder.textContent = 'No Receipt Photo';
                      parent.insertBefore(placeholder, e.currentTarget);
                    }
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-secondary flex items-center justify-center rounded text-muted-foreground mb-2">
                  No Receipt Photo
                </div>
              )}
              <div className="text-center font-medium">Receipt Photo</div>
            </div>
          </div>
        </Card>

        {/* Payment History */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-foreground">Payment History</h3>
            <div />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left p-4 text-muted-foreground font-medium">Date</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Type</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center p-8 text-muted-foreground">No payments recorded yet</td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="p-4 text-foreground">
                        {new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4 font-semibold text-foreground">
                        {formatIndianCurrency(payment.amount, { showCurrency: true })}
                      </td>
                      <td className="p-4">
                        <Badge className={
                          payment.paymentType === 'FULL' 
                            ? "bg-success/10 text-success border-success/20" 
                            : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        }>
                          {payment.paymentType}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Payment Modal */}
      {pledge && (
        <PaymentModal
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          pledgeId={pledge.id}
          currentAmount={pledge.remainingAmount ?? pledge.amount ?? pledge.loanAmount ?? 0}
          interestRate={pledge.interestRate ?? 0}
            onPaymentSuccess={() => {
              // Refresh pledge data and payment history
              const fetchPledgeData = async () => {
                try {
                  const token = localStorage.getItem("token");
                  const apiUrl = getApiUrl();
                  
                  // Refresh pledge data
                  const pledgeResponse = await fetch(`${apiUrl}/pledges/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });

                  if (pledgeResponse.ok) {
                    const data = await pledgeResponse.json();
                    
                    // Helper function to validate and clean photo URLs
                    const cleanPhotoUrl = (url: string | null | undefined): string | undefined => {
                      if (!url) return undefined;
                      const cleaned = url.trim();
                      return cleaned.length > 0 ? cleaned : undefined;
                    };
                    
                    const normalized: Pledge = {
                      ...data,
                      loanAmount: data.amount ?? 0,
                      remainingAmount: data.remainingAmount ?? data.amount ?? 0,
                      itemType: data.itemType ?? data.title ?? "Pledge Item",
                      pledgeDate: data.createdAt ?? new Date().toISOString(),
                      status: (data.status || "").toString(),
                      customerPhoto: cleanPhotoUrl(data.customerPhoto),
                      itemPhoto: cleanPhotoUrl(data.itemPhoto),
                      receiptPhoto: cleanPhotoUrl(data.receiptPhoto),
                    };
                    setPledge(normalized);
                  }

                  // Refresh payment history
                  const paymentsResponse = await fetch(`${apiUrl}/payments/pledge/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });

                  if (paymentsResponse.ok) {
                    const paymentsData = await paymentsResponse.json();
                    setPayments(paymentsData.data || []);
                  }
                } catch (error) {
                  console.error("Error refreshing pledge:", error);
                }
              };
              fetchPledgeData();
            }}
        />
      )}
    </Layout>
  );
};

export default PledgeDetail;
