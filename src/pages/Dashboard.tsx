import Layout from "@/components/Layout";
import StatsCard from "@/components/StatsCard";
import { Users, Package, IndianRupee, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalCustomers: number;
  activePledges: number;
  totalLoans: number;
  monthlyInterest: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activePledges: 0,
    totalLoans: 0,
    monthlyInterest: 0,
  });

  useEffect(() => {
    // Fetch dashboard stats from backend
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8099/api/dashboard/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
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
            trend="+5% from last month"
            trendUp={true}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-foreground">
              Recent Pledges
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Gold Necklace</p>
                  <p className="text-sm text-muted-foreground">22K - 50g</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gold">₹75,000</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
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

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-foreground">
              Interest Rate Tiers
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                <p className="text-sm text-muted-foreground">₹1 - ₹50,000</p>
                <p className="text-2xl font-bold text-success">3%</p>
                <p className="text-xs text-muted-foreground mt-1">per month</p>
              </div>
              <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                <p className="text-sm text-muted-foreground">₹50,001 - ₹1,00,000</p>
                <p className="text-2xl font-bold text-warning">2.5%</p>
                <p className="text-xs text-muted-foreground mt-1">per month</p>
              </div>
              <div className="p-4 bg-gold/10 rounded-lg border border-gold/20">
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
