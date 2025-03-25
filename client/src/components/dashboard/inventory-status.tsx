import { Card } from "@/components/ui/card";

interface InventoryItem {
  name: string;
  percentage: number;
}

interface InventoryStatusProps {
  items: InventoryItem[];
}

export function InventoryStatus({ items }: InventoryStatusProps) {
  // Helper function to get appropriate color class based on percentage
  const getColorClass = (percentage: number) => {
    if (percentage < 25) return "bg-red-600"; // Low stock
    if (percentage < 50) return "bg-amber-500"; // Medium stock
    return "bg-emerald-600"; // Good stock
  };

  return (
    <Card>
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Inventory Status</h3>
        <a href="/inventory" className="text-sm font-medium text-primary hover:text-indigo-700">Manage</a>
      </div>
      <div className="px-4 py-3 sm:px-6">
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-700">{item.name}</p>
                <p className="text-sm font-medium text-gray-900">{item.percentage}%</p>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`${getColorClass(item.percentage)} h-2 rounded-full`} 
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
