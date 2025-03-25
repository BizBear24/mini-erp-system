import { useQuery } from "@tanstack/react-query";
import { KPICard } from "@/components/ui/kpi-card";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { InventoryStatus } from "@/components/dashboard/inventory-status";
import { RecentCustomers } from "@/components/dashboard/recent-customers";
import { MarketplaceActivity } from "@/components/dashboard/marketplace-activity";
import { AlertTriangle, BarChart, DollarSign, ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
  revenue: number;
  ordersThisWeek: number;
  inventoryCount: number;
  lowStockCount: number;
  recentOrders: any[];
  recentCustomers: any[];
  inventoryStatus: { name: string; percentage: number }[];
  monthlySales: { name: string; sales: number }[];
}

export default function Dashboard() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  // Marketplace activity data (static for now)
  const marketplaceActivities = [
    {
      id: 1,
      title: "New B2B supplier joined",
      description: "Office Depot - Office Supplies",
      time: "2 hours ago",
      type: "primary"
    },
    {
      id: 2,
      title: "Price drop alert",
      description: "Bulk paper supplies",
      time: "5 hours ago",
      type: "secondary"
    },
    {
      id: 3,
      title: "New product categories",
      description: "Ergonomic furniture",
      time: "1 day ago",
      type: "accent"
    },
    {
      id: 4,
      title: "Supplier promotion",
      description: "Electronics Ltd. - 15% discount",
      time: "2 days ago",
      type: "neutral"
    }
  ];

  if (error) {
    return (
      <div className="py-4">
        <div className="p-4 bg-red-50 text-red-800 rounded-md">
          <h2 className="text-lg font-semibold">Error Loading Dashboard</h2>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="py-4">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Overview of your business performance</p>
      </div>
      
      {/* KPI Cards */}
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <KPICard 
              title="Total Revenue" 
              value={`$${data?.revenue.toFixed(2)}`} 
              icon={<DollarSign className="h-5 w-5 text-primary" />} 
              iconBgClass="bg-indigo-100" 
              changePercent={12} 
              changeDirection="up" 
            />
            
            <KPICard 
              title="Orders This Week" 
              value={data?.ordersThisWeek || 0} 
              icon={<ShoppingCart className="h-5 w-5 text-blue-500" />} 
              iconBgClass="bg-blue-100" 
              changePercent={8} 
              changeDirection="up" 
            />
            
            <KPICard 
              title="Inventory Items" 
              value={data?.inventoryCount || 0} 
              icon={<i className="fas fa-box text-teal-500"></i>} 
              iconBgClass="bg-teal-100" 
              changePercent={3} 
              changeDirection="down" 
            />
            
            <KPICard 
              title="Low Stock Alerts" 
              value={data?.lowStockCount || 0} 
              icon={<AlertTriangle className="h-5 w-5 text-red-500" />} 
              iconBgClass="bg-red-100" 
              changePercent={4} 
              changeDirection="up" 
            />
          </>
        )}
      </div>
      
      {/* Charts & Tables */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {isLoading ? (
          <>
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </>
        ) : (
          <>
            <RecentOrders 
              orders={data?.recentOrders.map(order => ({
                id: order.id,
                orderNumber: order.orderNumber,
                customerId: order.customerId,
                customerName: order.customerName || "Customer",
                status: order.status,
                totalAmount: order.totalAmount
              })) || []} 
            />
            
            <SalesChart data={data?.monthlySales || []} />
          </>
        )}
      </div>
      
      {/* Additional widgets */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </>
        ) : (
          <>
            <InventoryStatus items={data?.inventoryStatus || []} />
            
            <RecentCustomers 
              customers={data?.recentCustomers.map(customer => ({
                id: customer.id,
                name: customer.name,
                lastOrderDate: "June 15, 2023", // This would come from the API in a real implementation
                isActive: customer.isActive || true
              })) || []} 
            />
            
            <MarketplaceActivity activities={marketplaceActivities} />
          </>
        )}
      </div>
    </div>
  );
}
