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
      <ProtectedRoute path="/" component={() => (
        <AppLayout>
          <Dashboard />
        </AppLayout>
      )} />
      <ProtectedRoute path="/inventory" component={() => (
        <AppLayout>
          <Inventory />
        </AppLayout>
      )} />
      <ProtectedRoute path="/orders" component={() => (
        <AppLayout>
          <Orders />
        </AppLayout>
      )} />
      <ProtectedRoute path="/customers" component={() => (
        <AppLayout>
          <Customers />
        </AppLayout>
      )} />
      <ProtectedRoute path="/products" component={() => (
        <AppLayout>
          <Products />
        </AppLayout>
      )} />
      <ProtectedRoute path="/marketplace" component={() => (
        <AppLayout>
          <Marketplace />
        </AppLayout>
      )} />
      <ProtectedRoute path="/reports" component={() => (
        <AppLayout>
          <Reports />
        </AppLayout>
      )} />
      <ProtectedRoute path="/invoices" component={() => (
        <AppLayout>
          <Invoices />
        </AppLayout>
      )} />
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
