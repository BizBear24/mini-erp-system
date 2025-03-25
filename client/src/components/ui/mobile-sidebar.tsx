import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { X } from "lucide-react";

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
    <>
      {/* Mobile menu toggle button */}
      <button 
        type="button" 
        className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
        onClick={toggleSidebar}
      >
        <i className="fas fa-bars"></i>
      </button>
      
      {/* Mobile menu */}
      <div 
        className={`md:hidden fixed inset-0 z-40 ${isOpen ? "block" : "hidden"}`}
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
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-semibold text-primary">SAsS<span className="text-gray-500 text-sm font-normal"> ERP</span></h1>
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
              <button 
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-gray-100"
              >
                <i className="fas fa-sign-out-alt w-5 h-5 mr-3 text-gray-500"></i>
                Logout
              </button>
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                  {user ? getInitials(user.fullName) : "U"}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-base font-medium text-gray-700">{user?.fullName || "User"}</p>
                <p className="text-sm font-medium text-gray-500">{user?.role === "shop_owner" ? "Shop Owner" : "Vendor"}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 w-14"></div>
      </div>
    </>
  );
}
