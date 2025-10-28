import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Dynamic API URL for mobile support
      const apiUrl = localStorage.getItem('apiUrl') || 
                     (window.location.hostname !== 'localhost' 
                       ? `http://${window.location.hostname}:8099/api` 
                       : 'http://localhost:8099/api');
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Store the token and user info
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("username", data.data.username);
        localStorage.setItem("role", data.data.role);

        toast.success("Login successful!");
        navigate("/dashboard"); // Redirect to dashboard after login
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-gold/10">
      <Card className="w-full max-w-md p-6 space-y-6 shadow-2xl border-2 border-gold/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-4">
          <div className="flex justify-center animate-in zoom-in duration-300">
            <div className="relative">
              <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl"></div>
              <img 
                src="/logos/Gode_Jwellers_Logo.jpg"
                alt="Gode Jewellers Logo" 
                className="w-24 h-24 rounded-full border-4 border-gold shadow-lg relative"
              />
            </div>
          </div>
          <div className="space-y-2 animate-in slide-in-from-top duration-500 delay-200">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gold to-gold/60 bg-clip-text text-transparent">
              Gode Jewellers
            </h1>
            <h2 className="text-xl font-semibold text-foreground">Pledge Management System</h2>
            <p className="text-muted-foreground">Enter your credentials to continue</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
			  
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, username: e.target.value }))
              }
              placeholder="Enter username"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Enter password"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-gold to-gold/80 hover:from-gold/90 hover:to-gold/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50" 
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        {/*<p className="text-sm text-center text-muted-foreground">*/}
        {/*  Use admin credentials:<br />*/}
        {/*  Username: admin<br />*/}
        {/*  Password: admin123*/}
        {/*</p>*/}
      </Card>
    </div>
  );
};

export default Login;
