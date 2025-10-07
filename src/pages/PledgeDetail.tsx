import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Weight, Calendar, IndianRupee, TrendingUp, User } from "lucide-react";
import { toast } from "sonner";

interface Pledge {
  id: number;
  customerId: number;
  customerName: string;
  itemType: string;
  weight: number;
  purity: string;
  loanAmount: number;
  interestRate: number;
  pledgeDate: string;
  pledgeDuration: number;
  status: "active" | "settled" | "overdue";
  notes?: string;
  payments: Payment[];
}

interface Payment {
  id: number;
  amount: number;
  paymentDate: string;
  paymentType: "interest" | "principal" | "full";
}

const PledgeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pledge, setPledge] = useState<Pledge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPledgeData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8099/api/pledges/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setPledge(data);
        } else {
          toast.error("Pledge not found");
          navigate("/pledges");
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
    switch (status) {
      case "active":
        return "bg-success/10 text-success border-success/20";
      case "settled":
        return "bg-muted text-muted-foreground border-border";
      case "overdue":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const calculateTotals = () => {
    if (!pledge) return { totalInterest: 0, totalPayable: 0, amountPaid: 0, balance: 0 };

    const monthlyInterest = (pledge.loanAmount * pledge.interestRate) / 100;
    const totalInterest = monthlyInterest * pledge.pledgeDuration;
    const totalPayable = pledge.loanAmount + totalInterest;
    const amountPaid = pledge.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const balance = totalPayable - amountPaid;

    return { totalInterest, totalPayable, amountPaid, balance };
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
                  <p className="font-medium text-foreground">{pledge.weight}g</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-xl text-gold mt-0.5">◆</span>
                <div>
                  <p className="text-sm text-muted-foreground">Purity</p>
                  <p className="font-medium text-gold">{pledge.purity}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gold mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Pledge Date</p>
                  <p className="font-medium text-foreground">
                    {new Date(pledge.pledgeDate).toLocaleDateString("en-IN", {
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
                    {pledge.customerName}
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
                  ₹{pledge.loanAmount.toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-gold/10 rounded-lg border border-gold/20">
                <p className="text-sm text-muted-foreground">Interest Rate</p>
                <p className="text-2xl font-bold text-gold">{pledge.interestRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">per month</p>
              </div>

              <div className="p-4 bg-secondary rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-2xl font-bold text-foreground">{pledge.pledgeDuration}</p>
                <p className="text-xs text-muted-foreground mt-1">months</p>
              </div>

              <div className="p-4 bg-secondary rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Total Interest</p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{totals.totalInterest.toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-success/10 rounded-lg border border-success/20 md:col-span-2">
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="text-3xl font-bold text-success">
                  ₹{totals.amountPaid.toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-warning/10 rounded-lg border border-warning/20 md:col-span-2">
                <p className="text-sm text-muted-foreground">Balance Due</p>
                <p className="text-3xl font-bold text-warning">
                  ₹{totals.balance.toLocaleString()}
                </p>
              </div>
            </div>

            {pledge.notes && (
              <div className="mt-4 p-4 bg-secondary rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-foreground">{pledge.notes}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Payment History */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-foreground">Payment History</h3>
            <Button>Record Payment</Button>
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
                {pledge.payments.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center p-8 text-muted-foreground">
                      No payments recorded yet
                    </td>
                  </tr>
                ) : (
                  pledge.payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-border">
                      <td className="p-4 text-foreground">
                        {new Date(payment.paymentDate).toLocaleDateString("en-IN")}
                      </td>
                      <td className="p-4 font-semibold text-success">
                        ₹{payment.amount.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="capitalize">
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
    </Layout>
  );
};

export default PledgeDetail;
