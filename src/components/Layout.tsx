import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutGrid,
  Users,
  Wallet,
  LogOut,
  Menu,
  X
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutGrid className="h-5 w-5" />,
      path: "/dashboard",
    },
    {
      title: "Customers",
      icon: <Users className="h-5 w-5" />,
      path: "/customers",
    },
    {
      title: "Pledges",
      icon: <Wallet className="h-5 w-5" />,
      path: "/pledges",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } bg-card border-r w-64`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-semibold">Pledge Master</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={`w-full justify-start gap-2 ${
                  location.pathname === item.path ? "bg-muted" : ""
                }`}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                {item.title}
              </Button>
            ))}
          </nav>

          <div className="p-4 border-t space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`${isSidebarOpen ? "md:ml-64" : ""}`}>
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
          <div className="flex h-14 items-center gap-4 px-4">
            <Button
              variant="ghost"
              size="icon"
              className={`md:hidden`}
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
