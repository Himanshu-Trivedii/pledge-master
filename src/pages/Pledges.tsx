import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatIndianCurrency } from "@/lib/utils";

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

const Pledges = () => {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPledges = async () => {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = localStorage.getItem('apiUrl') || 
                       (window.location.hostname !== 'localhost' 
                         ? `http://${window.location.hostname}:8099/api` 
                         : 'http://localhost:8099/api');
        const response = await fetch(`${apiUrl}/pledges`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          console.error("Failed to fetch pledges:", response.status);
          setPledges([]);
          return;
        }
        const body = await response.json().catch(() => null);
        if (!body) {
          setPledges([]);
          return;
        }
        // Backend may return either a raw list or ApiResponse { success, message, data }
        const maybeList = Array.isArray(body) ? body : body?.data;
        setPledges(Array.isArray(maybeList) ? maybeList : []);
      } catch (error) {
        console.error("Error fetching pledges:", error);
        setPledges([]);
      }
    };

    fetchPledges();
  }, []);

  const filteredPledges = pledges.filter((pledge) => {
    const q = searchTerm.toLowerCase();
    return (
      pledge.title.toLowerCase().includes(q) ||
      pledge.description.toLowerCase().includes(q) ||
      pledge.itemType.toLowerCase().includes(q) ||
      pledge.purity.toLowerCase().includes(q)
    );
  });

  const getStatusColor = (status: string) => {
    switch ((status || "").toUpperCase()) {
      case "ACTIVE":
        return "bg-success/10 text-success border-success/20";
      case "COMPLETED":
        return "bg-muted text-muted-foreground border-border";
      case "DEFAULTED":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "CLOSED":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <Layout>
      <div className="px-4 py-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Pledges</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Track and manage gold pledges and loans
            </p>
          </div>
          <Button 
            onClick={() => navigate("/pledges/new")}
            className="w-full sm:w-auto bg-gradient-to-r from-gold to-gold/80 hover:from-gold/90 hover:to-gold/70 text-primary-foreground shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Pledge
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by customer or item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        {/* Pledges List */}
        {filteredPledges.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">No pledges found</p>
            <Button className="mt-4" onClick={() => navigate("/pledges/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Pledge
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPledges.map((pledge) => (
              <Card 
                key={pledge.id}
                className="p-4 sm:p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-gold/30"
                onClick={() => navigate(`/pledges/${pledge.id}`)}
              >
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="font-semibold text-base sm:text-lg text-foreground truncate">{pledge.itemType}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Weight: {pledge.weight}g</p>
                    </div>
                    <Badge className={`${getStatusColor(pledge.status)} flex-shrink-0`}>
                      {pledge.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Purity</p>
                      <p className="font-semibold text-gold">{pledge.purity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Interest</p>
                      <p className="font-semibold text-gold">{pledge.interestRate}%</p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Amount</p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">
                      {formatIndianCurrency(pledge.amount, { showCurrency: true })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Created: {new Date(pledge.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Pledges;
