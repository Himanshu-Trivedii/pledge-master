import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, Phone, Mail, MapPin, Search, Edit, Trash2 } from "lucide-react";
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


interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
}

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchTerm)) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.address && customer.address.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem("token");
            const apiUrl = getApiUrl(); // ✅ Use the centralized function

            const response = await fetch(`${apiUrl}/customers`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCustomers(data.data);
                    setFilteredCustomers(data.data);
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

  // const fetchCustomers = async () => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const apiUrl = localStorage.getItem('apiUrl') ||
  //                    (window.location.hostname !== 'localhost'
  //                      ? `http://${window.location.hostname}:8099/api`
  //                      : 'http://localhost:8099/api');
  //     const response = await fetch(`${apiUrl}/customers`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //
  //     if (response.ok) {
  //       const data = await response.json();
  //       if (data.success) {
  //         setCustomers(data.data);
  //         setFilteredCustomers(data.data);
  //       } else {
  //         toast.error(data.message || "Failed to fetch customers");
  //       }
  //     } else {
  //       toast.error("Failed to fetch customers");
  //     }
  //   } catch (error) {
  //     toast.error("Error connecting to the server");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <Layout>
      <div className="px-4 py-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Customers</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">Manage your customer records</p>
          </div>
          <Button 
            onClick={() => navigate("/customers/new")}
            className="w-full sm:w-auto bg-gradient-to-r from-gold to-gold/80 hover:from-gold/90 hover:to-gold/70 text-primary-foreground shadow-lg"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            New Customer
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by name, phone, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-2">
              Showing {filteredCustomers.length} of {customers.length} customers
            </p>
          )}
        </div>

        {loading ? (
          <Card className="p-12 text-center">
            <div className="text-sm sm:text-lg text-muted-foreground">Loading customers...</div>
          </Card>
        ) : filteredCustomers.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">
              {searchTerm ? "No customers found matching your search" : "No customers found"}
            </p>
            {!searchTerm && (
              <Button className="mt-4" onClick={() => navigate("/customers/new")}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Your First Customer
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer) => (
              <Card 
                key={customer.id}
                className="p-4 sm:p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-gold/30"
                onClick={() => navigate(`/customers/${customer.id}`)}
              >
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="font-semibold text-base sm:text-lg text-foreground truncate">{customer.name}</h3>
                      <Badge variant="outline" className="mt-2 text-xs">
                        <Mail className="mr-1 h-3 w-3" />
                        <span className="truncate">{customer.email}</span>
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customers/${customer.id}`);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete customer "{customer.name}"? This action cannot be undone and will also delete all associated pledges.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const token = localStorage.getItem("token");
                                  const apiUrl = getApiUrl();
                                  const response = await fetch(`${apiUrl}/customers/${customer.id}`, {
                                    method: "DELETE",
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  });

                                  if (response.ok) {
                                    const result = await response.json();
                                    if (result.success) {
                                      toast.success("Customer deleted successfully");
                                      fetchCustomers(); // Refresh the list
                                    } else {
                                      toast.error(result.message || "Failed to delete customer");
                                    }
                                  } else {
                                    const errorData = await response.json().catch(() => ({ message: "Failed to delete customer" }));
                                    toast.error(errorData.message || "Failed to delete customer");
                                  }
                                } catch (error) {
                                  toast.error("Error deleting customer");
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
                  
                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex items-center text-sm">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-foreground font-medium">{customer.phone}</span>
                    </div>
                    <div className="flex items-start text-sm">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground break-words">{customer.address}</span>
                    </div>
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

export default Customers;
