import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Settings, UserCircle } from "lucide-react";
import { Button } from "./button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
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
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-700 truncate">{user?.fullName || "User"}</p>
              <p className="text-xs font-medium text-gray-500">
                {user?.role === "shop_owner" ? "Shop Owner" : "Vendor"}
                {user?.companyName && ` at ${user.companyName}`}
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </aside>
  );
}
