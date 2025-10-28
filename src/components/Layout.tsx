import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import InstallPrompt from "@/components/InstallPrompt";
import InstallModal from "@/components/InstallModal";
import {
  LayoutGrid,
  Users,
  Wallet,
  LogOut,
  Menu,
  X,
  Download
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const showInstallInstructions = () => {
    setShowInstallModal(true);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-gold/5">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } bg-gradient-to-b from-card to-card/95 backdrop-blur-md border-r border-gold/10 shadow-lg w-64`}
      >
        <div className="flex h-full flex-col pt-safe">
          <div className="flex items-center justify-between px-4 py-4 pt-8">
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
                className={`w-full justify-start gap-2 transition-all hover:scale-105 ${
                  location.pathname === item.path ? "bg-gradient-to-r from-gold/20 to-gold/10 text-gold font-semibold" : ""
                }`}
                onClick={() => {
                  navigate(item.path);
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 768) {
                    setIsSidebarOpen(false);
                  }
                }}
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
            {(() => {
              const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
              const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
              if (!isStandalone) {
                return (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 border-gold/30 text-gold hover:bg-gold/10"
                    onClick={showInstallInstructions}
                  >
                    <Download className="h-5 w-5" />
                    Install App
                  </Button>
                );
              }
              return null;
            })()}
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
        <header className="sticky top-0 z-30 border-b bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-md shadow-sm">
          <div className="flex h-14 items-center gap-4 px-4 pt-safe pb-safe">
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
        <main className="p-4 sm:p-6">
          <InstallPrompt />
          <InstallModal open={showInstallModal} onOpenChange={setShowInstallModal} />
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
