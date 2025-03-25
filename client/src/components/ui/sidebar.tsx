import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Cog } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navigationItems = [
    { path: "/", label: "Dashboard", icon: "fa-tachometer-alt" },
    { path: "/inventory", label: "Inventory", icon: "fa-box" },
    { path: "/orders", label: "Orders", icon: "fa-shopping-cart" },
    { path: "/customers", label: "Customers", icon: "fa-users" },
    { path: "/products", label: "Products", icon: "fa-tag" },
    { path: "/marketplace", label: "Marketplace", icon: "fa-store" },
    { path: "/reports", label: "Reports", icon: "fa-chart-bar" },
    { path: "/invoices", label: "Invoices", icon: "fa-file-invoice-dollar" },
  ];

  const isActive = (path: string) => location === path;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <aside className="hidden md:flex md:w-64 flex-col fixed inset-y-0 border-r border-gray-200 bg-white z-10">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-primary">SAsS<span className="text-gray-500 text-sm font-normal"> ERP</span></h1>
      </div>
      
      <div className="flex flex-col justify-between h-full overflow-y-auto">
        <nav className="px-2 py-4 space-y-1">
          {navigationItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path} 
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive(item.path) 
                  ? "bg-primary text-white" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <i className={`fas ${item.icon} w-5 h-5 mr-2 ${isActive(item.path) ? "text-white" : "text-gray-500"}`}></i>
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                {user ? getInitials(user.fullName) : "U"}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.fullName || "User"}</p>
              <p className="text-xs font-medium text-gray-500">{user?.role === "shop_owner" ? "Shop Owner" : "Vendor"}</p>
            </div>
            <button 
              onClick={handleLogout} 
              className="ml-auto text-gray-500 hover:text-gray-700"
            >
              <Cog className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
