import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Weight, Calendar, User, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { PaymentModal } from "@/components/PaymentModal";
import { formatIndianCurrency } from "@/lib/utils";

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

  useEffect(() => {
    const fetchPledgeData = async () => {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = localStorage.getItem('apiUrl') || 
                       (window.location.hostname !== 'localhost' 
                         ? `http://${window.location.hostname}:8099/api` 
                         : 'http://localhost:8099/api');
        
        // Fetch pledge data
        const pledgeResponse = await fetch(`${apiUrl}/pledges/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (pledgeResponse.ok) {
          const data = await pledgeResponse.json();
          // Normalize fields for UI
          const normalized: Pledge = {
            ...data,
            loanAmount: data.amount ?? 0,
            remainingAmount: data.remainingAmount ?? data.amount ?? 0,
            itemType: data.itemType ?? data.title ?? "Pledge Item",
            pledgeDate: data.createdAt ?? new Date().toISOString(),
            status: (data.status || "").toString(),
          };
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

    const principal = pledge.remainingAmount ?? pledge.amount ?? 0;
    // Interest rate is already monthly (3%, 2.5%, or 2%), not annual
    const monthlyInterest = (principal * (pledge.interestRate ?? 0)) / 100;
    const totalInterest = monthlyInterest * (pledge.pledgeDuration ?? 0);
    const totalPayable = (pledge.amount ?? 0) + totalInterest; // original principal + interest
    
    // Calculate total amount paid from payment history
    const amountPaid = payments.reduce((total, payment) => total + payment.amount, 0);
    const balance = pledge.remainingAmount ?? 0;

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
          <Badge className={getStatusColor(pledge.status)}>{pledge.status}</Badge>
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
                <p className="text-2xl font-bold text-primary">
                  {formatIndianCurrency(pledge.amount ?? pledge.loanAmount ?? 0, { showCurrency: true })}
                </p>
              </div>

              <div className="p-4 bg-gold/10 rounded-lg border border-gold/20">
                <p className="text-sm text-muted-foreground">Interest Rate</p>
                <p className="text-2xl font-bold text-gold">{(pledge.interestRate ?? 0).toFixed(2)}%</p>
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
          currentAmount={pledge.amount || pledge.loanAmount || 0}
            onPaymentSuccess={() => {
              // Refresh pledge data and payment history
              const fetchPledgeData = async () => {
                try {
                  const token = localStorage.getItem("token");
                  
                  // Refresh pledge data
                  const pledgeResponse = await fetch(`http://localhost:8099/api/pledges/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });

                  if (pledgeResponse.ok) {
                    const data = await pledgeResponse.json();
                    const normalized: Pledge = {
                      ...data,
                      loanAmount: data.amount ?? 0,
                      remainingAmount: data.remainingAmount ?? data.amount ?? 0,
                      itemType: data.itemType ?? data.title ?? "Pledge Item",
                      pledgeDate: data.createdAt ?? new Date().toISOString(),
                      status: (data.status || "").toString(),
                    };
                    setPledge(normalized);
                  }

                  // Refresh payment history
                  const paymentsResponse = await fetch(`http://localhost:8099/api/payments/pledge/${id}`, {
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
