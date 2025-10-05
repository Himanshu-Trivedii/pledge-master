import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Pledge {
  id: number;
  customerName: string;
  itemType: string;
  weight: number;
  purity: string;
  loanAmount: number;
  interestRate: number;
  pledgeDate: string;
  status: "active" | "settled" | "overdue";
}

const Pledges = () => {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPledges = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/api/pledges", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setPledges(data);
        }
      } catch (error) {
        console.error("Error fetching pledges:", error);
      }
    };

    fetchPledges();
  }, []);

  const filteredPledges = pledges.filter(
    (pledge) =>
      pledge.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pledge.itemType.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Pledges</h1>
            <p className="text-muted-foreground mt-2">
              Track and manage gold pledges and loans
            </p>
          </div>
          <Button onClick={() => navigate("/pledges/new")}>
            <Plus className="mr-2 h-5 w-5" />
            New Pledge
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by customer or item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Pledges List */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left p-4 text-muted-foreground font-medium">
                    Customer
                  </th>
                  <th className="text-left p-4 text-muted-foreground font-medium">
                    Item
                  </th>
                  <th className="text-left p-4 text-muted-foreground font-medium">
                    Weight
                  </th>
                  <th className="text-left p-4 text-muted-foreground font-medium">
                    Purity
                  </th>
                  <th className="text-left p-4 text-muted-foreground font-medium">
                    Loan Amount
                  </th>
                  <th className="text-left p-4 text-muted-foreground font-medium">
                    Interest Rate
                  </th>
                  <th className="text-left p-4 text-muted-foreground font-medium">
                    Date
                  </th>
                  <th className="text-left p-4 text-muted-foreground font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPledges.map((pledge) => (
                  <tr
                    key={pledge.id}
                    className="border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/pledges/${pledge.id}`)}
                  >
                    <td className="p-4 font-medium text-foreground">
                      {pledge.customerName}
                    </td>
                    <td className="p-4 text-foreground">{pledge.itemType}</td>
                    <td className="p-4 text-foreground">{pledge.weight}g</td>
                    <td className="p-4 text-gold font-semibold">
                      {pledge.purity}
                    </td>
                    <td className="p-4 font-semibold text-foreground">
                      ₹{pledge.loanAmount.toLocaleString()}
                    </td>
                    <td className="p-4 text-gold">{pledge.interestRate}%</td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(pledge.pledgeDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusColor(pledge.status)}>
                        {pledge.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Pledges;
