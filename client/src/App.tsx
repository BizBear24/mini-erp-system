import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import Orders from "@/pages/orders";
import Customers from "@/pages/customers";
import Products from "@/pages/products";
import Marketplace from "@/pages/marketplace";
import Reports from "@/pages/reports";
import Invoices from "@/pages/invoices";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import AppLayout from "./layout/app-layout";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      {/* Accessible to all authenticated users */}
      <ProtectedRoute path="/" component={() => (
        <AppLayout>
          <Dashboard />
        </AppLayout>
      )} />
      
      {/* Shop owner specific routes */}
      <ProtectedRoute 
        path="/inventory" 
        allowedRoles={["shop_owner"]}
        component={() => (
          <AppLayout>
            <Inventory />
          </AppLayout>
        )} 
      />
      
      <ProtectedRoute 
        path="/orders" 
        allowedRoles={["shop_owner"]}
        component={() => (
          <AppLayout>
            <Orders />
          </AppLayout>
        )} 
      />
      
      <ProtectedRoute 
        path="/customers" 
        allowedRoles={["shop_owner"]}
        component={() => (
          <AppLayout>
            <Customers />
          </AppLayout>
        )} 
      />
      
      <ProtectedRoute 
        path="/invoices" 
        allowedRoles={["shop_owner"]}
        component={() => (
          <AppLayout>
            <Invoices />
          </AppLayout>
        )} 
      />
      
      {/* Vendor specific routes */}
      <ProtectedRoute 
        path="/products" 
        allowedRoles={["vendor"]}
        component={() => (
          <AppLayout>
            <Products />
          </AppLayout>
        )} 
      />
      
      {/* Accessible to both roles */}
      <ProtectedRoute 
        path="/marketplace" 
        allowedRoles={["shop_owner", "vendor"]}
        component={() => (
          <AppLayout>
            <Marketplace />
          </AppLayout>
        )} 
      />
      
      <ProtectedRoute 
        path="/reports" 
        allowedRoles={["shop_owner", "vendor"]}
        component={() => (
          <AppLayout>
            <Reports />
          </AppLayout>
        )} 
      />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
