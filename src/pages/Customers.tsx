import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { UserPlus, Phone, Mail, MapPin } from "lucide-react";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  idProofType: string;
  idProofNumber: string;
}

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8099/api/customers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCustomers(data.data);
        } else {
          toast.error(data.message || "Failed to fetch customers");
        }
      } else {
        toast.error("Failed to fetch customers");
      }
    } catch (error) {
      toast.error("Error connecting to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Customers</h1>
            <p className="text-muted-foreground mt-2">Manage your customer records</p>
          </div>
          <Button onClick={() => navigate("/customers/new")}>
            <UserPlus className="mr-2 h-4 w-4" />
            New Customer
          </Button>
        </div>

        <Card className="p-6">
          {loading ? (
            <div className="text-center py-8">Loading customers...</div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No customers found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate("/customers/new")}
              >
                Add Your First Customer
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>ID Proof</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/customers/${customer.id}`)}
                  >
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center text-sm">
                          <Phone className="mr-2 h-4 w-4" />
                          {customer.phone}
                        </span>
                        <span className="flex items-center text-sm text-muted-foreground">
                          <Mail className="mr-2 h-4 w-4" />
                          {customer.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{customer.idProofType}</span>
                        <span className="text-sm text-muted-foreground">
                          {customer.idProofNumber}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start">
                        <MapPin className="mr-2 h-4 w-4 mt-0.5" />
                        <span className="text-sm">{customer.address}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customers/${customer.id}`);
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Customers;
