import { ReactNode } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgClass: string;
  changePercent?: number;
  changeDirection?: 'up' | 'down';
}

export function KPICard({
  title,
  value,
  icon,
  iconBgClass,
  changePercent,
  changeDirection = 'up',
}: KPICardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${iconBgClass}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {changePercent !== undefined && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    changeDirection === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {changeDirection === 'up' ? (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    )}
                    <span className="sr-only">
                      {changeDirection === 'up' ? 'Increased' : 'Decreased'} by
                    </span>
                    {changePercent}%
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
