import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CustomerItem {
  id: number;
  name: string;
  lastOrderDate?: string | Date;
  isActive: boolean;
}

interface RecentCustomersProps {
  customers: CustomerItem[];
  isLoading?: boolean;
}

export function RecentCustomers({ customers, isLoading = false }: RecentCustomersProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return "No orders yet";
    const formattedDate = new Date(date);
    return formattedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <Card>
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Customers</h3>
        <a href="/customers" className="text-sm font-medium text-primary hover:text-indigo-700">View all</a>
      </div>
      <div className="px-4 py-3 sm:px-6 space-y-4">
        {isLoading ? (
          <p className="text-center text-sm text-gray-500">Loading customers...</p>
        ) : customers.length === 0 ? (
          <p className="text-center text-sm text-gray-500">No customers found</p>
        ) : (
          customers.map((customer) => (
            <div key={customer.id} className="flex items-center space-x-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 font-medium">{getInitials(customer.name)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{customer.name}</p>
                <p className="text-xs text-gray-500 truncate">Last order: {formatDate(customer.lastOrderDate)}</p>
              </div>
              <div>
                <Badge className={`${customer.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-300 text-gray-800'}`}>
                  {customer.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
