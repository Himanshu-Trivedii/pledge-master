import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, MapPin, FileText, Edit } from "lucide-react";
import { toast } from "sonner";
import { formatIndianCurrency } from "@/lib/utils";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  idProofType: string;
  idProofNumber: string;
  createdAt: string;
  isActive: boolean;
}

interface Pledge {
  id: number;
  customerId: number;
  title: string;
  description: string;
  amount: number;
  interestRate: number;
  createdAt: string;
  deadline: string;
  status: string;
  itemType: string;
  weight: number;
  purity: string;
  notes: string;
  pledgeDuration: number;
}

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = localStorage.getItem('apiUrl') || 
                       (window.location.hostname !== 'localhost' 
                         ? `http://${window.location.hostname}:8099/api` 
                         : 'http://localhost:8099/api');
        
        // Fetch customer details
        const customerResponse = await fetch(
          `${apiUrl}/customers/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (customerResponse.ok) {
          const customerData = await customerResponse.json();
          setCustomer(customerData.data);

          // Fetch customer's pledges
          const pledgesResponse = await fetch(
            `${apiUrl}/pledges/customer/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (pledgesResponse.ok) {
            const pledgesData = await pledgesResponse.json();
            setPledges(pledgesData || []);
            
            // Debug: Log pledge data
            console.log("DEBUG: Customer pledges:", pledgesData);
            console.log("DEBUG: Active pledges count:", pledgesData?.filter((p: any) => p.status?.toUpperCase() === 'ACTIVE').length);
          }
        } else {
          toast.error("Customer not found");
          navigate("/customers");
        }
      } catch (error) {
        toast.error("Error loading customer data");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [id, navigate]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-success/10 text-success border-success/20";
      case "PARTIALLY_PAID":
        return "bg-warning/10 text-warning border-warning/20";
      case "SETTLED":
      case "COMPLETED":
      case "CLOSED":
        return "bg-muted text-muted-foreground border-border";
      case "OVERDUE":
      case "DEFAULTED":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading customer details...</p>
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/customers")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-foreground">{customer.name}</h1>
              <p className="text-muted-foreground mt-2">Customer Details</p>
            </div>
          </div>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Customer
          </Button>
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gold mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">{customer.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gold mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{customer.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gold mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium text-foreground">{customer.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gold mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">ID Proof</p>
                  <p className="font-medium text-foreground">
                    {customer.idProofType} - {customer.idProofNumber}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Summary</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gold/10 rounded-lg border border-gold/20">
                <p className="text-sm text-muted-foreground">Active Pledges</p>
                <p className="text-3xl font-bold text-gold">
                  {pledges.filter(pledge => {
                    const status = pledge.status?.toUpperCase();
                    return status === 'ACTIVE' || status === 'PARTIALLY_PAID';
                  }).length}
                </p>
              </div>

              <div className="p-4 bg-secondary rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Total Loans</p>
                <p className="text-3xl font-bold text-foreground">
                  {formatIndianCurrency(pledges.reduce((total, pledge) => total + pledge.amount, 0), { showCurrency: true })}
                </p>
              </div>

              <div className="p-4 bg-secondary rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Customer Since</p>
                <p className="text-lg font-semibold text-foreground">
                  {new Date(customer.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Pledge History */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-foreground">Pledge History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left p-4 text-muted-foreground font-medium">Item</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Weight</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Purity</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Loan Amount</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Interest Rate</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Date</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {pledges.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-muted-foreground">
                      No pledges found for this customer
                    </td>
                  </tr>
                ) : (
                  pledges.map((pledge) => (
                    <tr
                      key={pledge.id}
                      className="border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/pledges/${pledge.id}`)}
                    >
                      <td className="p-4 font-medium text-foreground">{pledge.itemType}</td>
                      <td className="p-4 text-foreground">{pledge.weight}g</td>
                      <td className="p-4 text-gold font-semibold">{pledge.purity}</td>
                      <td className="p-4 font-semibold text-foreground">
                        {formatIndianCurrency(pledge.amount, { showCurrency: true })}
                      </td>
                      <td className="p-4 text-gold">{pledge.interestRate}%</td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(pledge.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(pledge.status)}>{pledge.status}</Badge>
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

export default CustomerDetail;
