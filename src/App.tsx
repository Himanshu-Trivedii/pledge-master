import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import NewCustomer from "@/pages/NewCustomer";
import CustomerDetail from "@/pages/CustomerDetail";
import Pledges from "@/pages/Pledges";
import NewPledge from "@/pages/NewPledge";
import NewPledgeSimple from "@/pages/NewPledgeSimple";
import PledgeDetail from "@/pages/PledgeDetail";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/customers" element={
          <ProtectedRoute>
            <Customers />
          </ProtectedRoute>
        } />

        <Route path="/customers/new" element={
          <ProtectedRoute>
            <NewCustomer />
          </ProtectedRoute>
        } />

        <Route path="/customers/:id" element={
          <ProtectedRoute>
            <CustomerDetail />
          </ProtectedRoute>
        } />

        <Route path="/pledges" element={
          <ProtectedRoute>
            <Pledges />
          </ProtectedRoute>
        } />

        <Route path="/pledges/new" element={
          <ProtectedRoute>
            <NewPledgeSimple />
          </ProtectedRoute>
        } />

        <Route path="/pledges/:id" element={
          <ProtectedRoute>
            <PledgeDetail />
          </ProtectedRoute>
        } />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
