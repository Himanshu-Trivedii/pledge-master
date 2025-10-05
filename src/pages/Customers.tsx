import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search, Eye } from "lucide-react";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  activePledges: number;
  totalLoans: number;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/api/customers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Customers</h1>
            <p className="text-muted-foreground mt-2">
              Manage customer profiles and loan history
            </p>
          </div>
          <Button onClick={() => navigate("/customers/new")}>
            <Plus className="mr-2 h-5 w-5" />
            Add Customer
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Customer List */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left p-4 text-muted-foreground font-medium">
                    Name
                  </th>
                  <th className="text-left p-4 text-muted-foreground font-medium">
                    Phone
                  </th>
                  <th className="text-left p-4 text-muted-foreground font-medium">
                    Email
                  </th>
                  <th className="text-left p-4 text-muted-foreground font-medium">
                    Active Pledges
                  </th>
                  <th className="text-left p-4 text-muted-foreground font-medium">
                    Total Loans
                  </th>
                  <th className="text-left p-4 text-muted-foreground font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <td className="p-4 font-medium text-foreground">
                      {customer.name}
                    </td>
                    <td className="p-4 text-foreground">{customer.phone}</td>
                    <td className="p-4 text-muted-foreground">
                      {customer.email}
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-gold/10 text-gold rounded-full text-sm">
                        {customer.activePledges}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-foreground">
                      ₹{customer.totalLoans.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/customers/${customer.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
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

export default Customers;
