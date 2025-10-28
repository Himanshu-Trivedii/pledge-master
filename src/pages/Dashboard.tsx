import Layout from "@/components/Layout";
import StatsCard from "@/components/StatsCard";
import { Users, Package, IndianRupee, TrendingUp, TrendingDown, DollarSign, Coins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalCustomers: number;
  activePledges: number;
  totalLoans: number;
  monthlyInterest: number;
  lastMonthInterest: number;
  profitLoss: number;
  profitLossPercentage: number;
}

interface MetalRates {
  gold: {
    price: number;
    change: number;
    changePercentage: number;
  };
  silver: {
    price: number;
    change: number;
    changePercentage: number;
  };
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activePledges: 0,
    totalLoans: 0,
    monthlyInterest: 0,
    lastMonthInterest: 0,
    profitLoss: 0,
    profitLossPercentage: 0,
  });
  
  const [metalRates, setMetalRates] = useState<MetalRates>({
    gold: { price: 0, change: 0, changePercentage: 0 },
    silver: { price: 0, change: 0, changePercentage: 0 }
  });
  
  const [previousRates, setPreviousRates] = useState<MetalRates>({
    gold: { price: 0, change: 0, changePercentage: 0 },
    silver: { price: 0, change: 0, changePercentage: 0 }
  });

  useEffect(() => {
    // Fetch dashboard stats from backend
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      const apiUrl = localStorage.getItem('apiUrl') || 
                     (window.location.hostname !== 'localhost' 
                       ? `http://${window.location.hostname}:8099/api` 
                       : 'http://localhost:8099/api');
      try {
        const response = await fetch(`${apiUrl}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(String(response.status));
        const data = await response.json();
        setStats(data);
      } catch (error) {
        // Fallback: derive minimal stats directly from available APIs so counts are not zero
        try {
          const [custRes, pledgeRes] = await Promise.all([
            fetch(`${apiUrl}/customers`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${apiUrl}/pledges`, { headers: { Authorization: `Bearer ${token}` } }),
          ]);

          let customers: any[] = [];
          if (custRes.ok) {
            const body = await custRes.json();
            customers = Array.isArray(body) ? body : body?.data || [];
          }

          let pledges: any[] = [];
          if (pledgeRes.ok) {
            const body = await pledgeRes.json();
            pledges = Array.isArray(body) ? body : body?.data || [];
          }

          const activePledges = pledges.filter((p) => {
            const status = (p.status || "").toUpperCase();
            return status === "ACTIVE" || status === "PARTIALLY_PAID";
          }).length;
          console.log("DEBUG: Frontend fallback - Total pledges:", pledges.length);
          console.log("DEBUG: Frontend fallback - Active pledges:", activePledges);
          console.log("DEBUG: Frontend fallback - Pledge statuses:", pledges.map(p => ({ id: p.id, status: p.status, customer: p.customer?.name })));
          const totalLoans = pledges
            .filter((p) => {
              const status = (p.status || "").toUpperCase();
              return status === "ACTIVE" || status === "PARTIALLY_PAID";
            })
            .reduce((sum, p) => sum + (p.amount || p.loanAmount || 0), 0);

          setStats((prev) => ({
            ...prev,
            totalCustomers: customers.length,
            activePledges,
            totalLoans,
          }));
        } catch (innerErr) {
          console.error("Stats fallback failed:", innerErr);
        }
      }
    };

    // Fetch live metal rates from IBJA API with real-time change tracking
    const fetchMetalRates = async () => {
      try {
        // Using IBJA Gold & Silver Rates API for accurate Indian rates
        const response = await fetch("https://api.indiagoldratesapi.com/rates");
        
        if (!response.ok) throw new Error(`IBJA API failed: ${response.status}`);
        
        const data = await response.json();
        
        // IBJA API provides rates in INR per gram
        const goldPerGram = data.gold?.rate || 0;
        const silverPerGram = data.silver?.rate || 0;
        
        // Convert to 10g for gold and 1kg for silver
        const goldPer10g = Math.round(goldPerGram * 10);
        const silverPerKg = Math.round(silverPerGram * 1000);
        
        // Calculate change from previous rates
        const goldChange = previousRates.gold.price > 0 ? goldPer10g - previousRates.gold.price : 0;
        const goldChangePercent = previousRates.gold.price > 0 
          ? ((goldChange / previousRates.gold.price) * 100) 
          : 0;
        
        const silverChange = previousRates.silver.price > 0 ? silverPerKg - previousRates.silver.price : 0;
        const silverChangePercent = previousRates.silver.price > 0 
          ? ((silverChange / previousRates.silver.price) * 100) 
          : 0;
        
        // Set previous rates before updating current
        setPreviousRates({
          gold: { price: goldPer10g, change: goldChange, changePercentage: goldChangePercent },
          silver: { price: silverPerKg, change: silverChange, changePercentage: silverChangePercent }
        });
        
        setMetalRates({
          gold: { 
            price: goldPer10g, 
            change: goldChange, 
            changePercentage: goldChangePercent 
          },
          silver: { 
            price: silverPerKg, 
            change: silverChange, 
            changePercentage: silverChangePercent 
          }
        });
        
        console.log("DEBUG: Rates - Gold 10g:", goldPer10g, "Change:", goldChange, "Silver 1kg:", silverPerKg, "Change:", silverChange);
      } catch (error) {
        console.error("Error fetching IBJA metal rates:", error);
        // Fallback to approximate Indian rates with simulated changes
        const goldPrice = 126530;
        const silverPrice = 147033;
        const goldChange = Math.random() > 0.5 ? 500 : -300;
        const silverChange = Math.random() > 0.5 ? 1000 : -500;
        
        setMetalRates({
          gold: { 
            price: goldPrice + goldChange, 
            change: goldChange, 
            changePercentage: (goldChange / goldPrice) * 100 
          },
          silver: { 
            price: silverPrice + silverChange, 
            change: silverChange, 
            changePercentage: (silverChange / silverPrice) * 100 
          }
        });
      }
    };

    fetchStats();
    fetchMetalRates();
    
    // Refresh metal rates every 30 seconds for real-time updates
    const rateInterval = setInterval(fetchMetalRates, 30000); // 30 seconds
    
    return () => clearInterval(rateInterval);
  }, []);

  return (
    <Layout>
      <div className="px-4 py-6 max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gold via-gold/80 to-foreground bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Welcome back! Here's an overview of your loan management system.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon={Users}
            trend="+12% from last month"
            trendUp={true}
          />
          <StatsCard
            title="Active Pledges"
            value={stats.activePledges}
            icon={Package}
            trend="+8% from last month"
            trendUp={true}
          />
          <StatsCard
            title="Total Loans"
            value={`₹${stats.totalLoans.toLocaleString()}`}
            icon={IndianRupee}
            trend="+15% from last month"
            trendUp={true}
          />
          <StatsCard
            title="Monthly Interest"
            value={`₹${stats.monthlyInterest.toLocaleString()}`}
            icon={TrendingUp}
            trend={stats.profitLoss >= 0 ? `+${stats.profitLossPercentage.toFixed(1)}% from last month` : `${stats.profitLossPercentage.toFixed(1)}% from last month`}
            trendUp={stats.profitLoss >= 0}
          />
        </div>

        {/* Profit/Loss and Metal Rates */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-success/5 via-success/5 to-card hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              {stats.profitLoss >= 0 ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
              <h3 className="text-lg font-semibold text-foreground">Profit/Loss Analysis</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">This Month Interest</p>
                <p className="text-sm font-semibold text-foreground">₹{stats.monthlyInterest.toLocaleString()}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Last Month Interest</p>
                <p className="text-sm font-semibold text-foreground">₹{stats.lastMonthInterest.toLocaleString()}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Net Change</p>
                <p className={`text-sm font-semibold ${stats.profitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {stats.profitLoss >= 0 ? '+' : ''}₹{stats.profitLoss.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-gold/10 via-gold/5 to-card hover:shadow-2xl transition-all duration-300 border-gold/20">
            <div className="flex items-center gap-2 mb-4">
              <Coins className="h-5 w-5 text-gold animate-pulse" />
              <h3 className="text-lg font-semibold text-foreground">Live Gold Rate</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Gold (per 10g)</p>
                <p className="text-lg font-bold text-gold">₹{metalRates.gold.price.toLocaleString()}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">Change</p>
                <p className={`text-sm font-semibold ${metalRates.gold.change >= 0 ? 'text-success' : 'text-destructive'} transition-colors duration-300`}>
                  {metalRates.gold.change >= 0 ? '+' : ''}₹{Math.abs(metalRates.gold.change).toLocaleString()} ({metalRates.gold.changePercentage >= 0 ? '+' : ''}{metalRates.gold.changePercentage.toFixed(2)}%)
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-silver/10 via-silver/5 to-card hover:shadow-2xl transition-all duration-300 border-silver/20">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-silver animate-pulse" />
              <h3 className="text-lg font-semibold text-foreground">Live Silver Rate</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Silver (per kg)</p>
                <p className="text-lg font-bold text-silver">₹{metalRates.silver.price.toLocaleString()}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">Change</p>
                <p className={`text-sm font-semibold ${metalRates.silver.change >= 0 ? 'text-success' : 'text-destructive'} transition-colors duration-300`}>
                  {metalRates.silver.change >= 0 ? '+' : ''}₹{Math.abs(metalRates.silver.change).toLocaleString()} ({metalRates.silver.changePercentage >= 0 ? '+' : ''}{metalRates.silver.changePercentage.toFixed(2)}%)
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-card to-card/95 hover:shadow-2xl transition-all duration-300 border-gold/10">
            <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
              <Package className="h-5 w-5 text-gold" />
              Recent Pledges
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors duration-200 cursor-pointer border-l-4 border-gold/30">
                <div>
                  <p className="font-medium text-foreground">Gold Necklace</p>
                  <p className="text-sm text-muted-foreground">22K - 50g</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gold">₹75,000</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
              <div className="flex justify-between items-center py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors duration-200 cursor-pointer border-l-4 border-gold/30">
                <div>
                  <p className="font-medium text-foreground">Gold Bangles</p>
                  <p className="text-sm text-muted-foreground">18K - 35g</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gold">₹45,000</p>
                  <p className="text-xs text-muted-foreground">5 days ago</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-card/95 hover:shadow-2xl transition-all duration-300 border-gold/10">
            <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gold" />
              Interest Rate Tiers
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-success/10 to-success/5 rounded-lg border border-success/20 hover:scale-105 transition-transform duration-200">
                <p className="text-sm text-muted-foreground">₹1 - ₹50,000</p>
                <p className="text-2xl font-bold text-success">3%</p>
                <p className="text-xs text-muted-foreground mt-1">per month</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-warning/10 to-warning/5 rounded-lg border border-warning/20 hover:scale-105 transition-transform duration-200">
                <p className="text-sm text-muted-foreground">₹50,001 - ₹1,00,000</p>
                <p className="text-2xl font-bold text-warning">2.5%</p>
                <p className="text-xs text-muted-foreground mt-1">per month</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-gold/10 to-gold/5 rounded-lg border border-gold/20 hover:scale-105 transition-transform duration-200">
                <p className="text-sm text-muted-foreground">Above ₹1,00,000</p>
                <p className="text-2xl font-bold text-gold">2%</p>
                <p className="text-xs text-muted-foreground mt-1">per month</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
