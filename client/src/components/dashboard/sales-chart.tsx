import { useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface SalesData {
  name: string;
  sales: number;
}

interface SalesChartProps {
  data: SalesData[];
  isLoading?: boolean;
}

export function SalesChart({ data, isLoading = false }: SalesChartProps) {
  const formatCurrency = (value: number) => {
    return `$${value.toFixed(0)}`;
  };

  return (
    <Card>
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Monthly Sales Overview</h3>
      </div>
      <div className="px-4 py-4 sm:px-6">
        <div className="h-64 bg-gray-50 border border-gray-200 rounded-md">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-gray-500">Loading sales data...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-gray-500">No sales data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => [`${formatCurrency(value as number)}`, 'Sales']} />
                <Bar dataKey="sales" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-2 text-center">Sales trend over the last 6 months</p>
      </div>
    </Card>
  );
}
