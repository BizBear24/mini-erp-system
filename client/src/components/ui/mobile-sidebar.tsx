import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { X, LogOut } from "lucide-react";

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    closeSidebar();
  };

  // Common navigation items for all users
  const commonNavItems = [
    { path: "/", label: "Dashboard", icon: "fa-tachometer-alt", roles: ["shop_owner", "vendor"] },
    { path: "/marketplace", label: "Marketplace", icon: "fa-store", roles: ["shop_owner", "vendor"] },
    { path: "/reports", label: "Reports", icon: "fa-chart-bar", roles: ["shop_owner", "vendor"] },
  ];

  // Shop owner specific navigation items
  const shopOwnerNavItems = [
    { path: "/inventory", label: "Inventory", icon: "fa-box", roles: ["shop_owner"] },
    { path: "/orders", label: "Orders", icon: "fa-shopping-cart", roles: ["shop_owner"] },
    { path: "/customers", label: "Customers", icon: "fa-users", roles: ["shop_owner"] },
    { path: "/invoices", label: "Invoices", icon: "fa-file-invoice-dollar", roles: ["shop_owner"] },
  ];

  // Vendor specific navigation items
  const vendorNavItems = [
    { path: "/products", label: "Products", icon: "fa-tag", roles: ["vendor"] },
  ];

  // Combine navigation items based on user role
  let navigationItems = [...commonNavItems];
  if (user?.role === "shop_owner") {
    navigationItems = [...navigationItems, ...shopOwnerNavItems];
  } else if (user?.role === "vendor") {
    navigationItems = [...navigationItems, ...vendorNavItems];
  }

  // Sort them by label
  navigationItems.sort((a, b) => {
    // Keep Dashboard at the top
    if (a.path === "/") return -1;
    if (b.path === "/") return 1;
    return a.label.localeCompare(b.label);
  });

  const isActive = (path: string) => location === path;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <>
      {/* Mobile menu toggle button */}
      <button 
        type="button" 
        className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
        onClick={toggleSidebar}
        aria-label="Open main menu"
      >
        <i className="fas fa-bars"></i>
      </button>
      
      {/* Mobile menu */}
      <div 
        className={`md:hidden fixed inset-0 z-40 ${isOpen ? "block" : "hidden"}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75" 
          onClick={closeSidebar}
        ></div>
        
        {/* Sidebar */}
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button 
              type="button" 
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={closeSidebar}
              aria-label="Close menu"
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-semibold text-primary">SAsS<span className="text-gray-500 text-sm font-normal"> ERP</span></h1>
            </div>
            <div className="px-4 mt-3">
              <p className="text-sm font-medium text-gray-700">Welcome, {user?.fullName || "User"}</p>
              <p className="text-xs font-medium text-gray-500">
                {user?.role === "shop_owner" ? "Shop Owner" : "Vendor"}
                {user?.companyName && ` at ${user.companyName}`}
              </p>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigationItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path} 
                  onClick={closeSidebar}
                  className={`flex items-center px-3 py-2 text-base font-medium rounded-md ${
                    isActive(item.path) 
                      ? "bg-primary text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <i className={`fas ${item.icon} w-5 h-5 mr-3 ${isActive(item.path) ? "text-white" : "text-gray-500"}`}></i>
                  {item.label}
                </Link>
              ))}
              
              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="px-3 space-y-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Account
                  </h3>
                  <Link 
                    href="#profile" 
                    className="flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    <i className="fas fa-user-circle w-5 h-5 mr-3 text-gray-500"></i>
                    Profile
                  </Link>
                  <Link 
                    href="#settings" 
                    className="flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    <i className="fas fa-cog w-5 h-5 mr-3 text-gray-500"></i>
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="w-5 h-5 mr-3 text-gray-500" />
                    Logout
                  </button>
                </div>
              </div>
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                  {user ? getInitials(user.fullName) : "U"}
                </div>
              </div>
              <div className="ml-3 flex-grow truncate">
                <p className="text-base font-medium text-gray-700 truncate">{user?.fullName || "User"}</p>
                <p className="text-sm font-medium text-gray-500 truncate">
                  {user?.email || ""}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 w-14"></div>
      </div>
    </>
  );
}
