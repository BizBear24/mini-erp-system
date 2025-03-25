import { Card } from "@/components/ui/card";

interface ActivityItem {
  id: number;
  title: string;
  description: string;
  time: string;
  type: 'primary' | 'secondary' | 'accent' | 'neutral';
}

interface MarketplaceActivityProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

export function MarketplaceActivity({ activities, isLoading = false }: MarketplaceActivityProps) {
  const getBorderClass = (type: string) => {
    switch(type) {
      case 'primary':
        return 'border-primary';
      case 'secondary':
        return 'border-blue-500';
      case 'accent':
        return 'border-teal-500';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <Card>
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Marketplace Activity</h3>
        <a href="/marketplace" className="text-sm font-medium text-primary hover:text-indigo-700">Go to marketplace</a>
      </div>
      <div className="px-4 py-3 sm:px-6">
        {isLoading ? (
          <p className="text-center text-sm text-gray-500">Loading activities...</p>
        ) : activities.length === 0 ? (
          <p className="text-center text-sm text-gray-500">No marketplace activities</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className={`border-l-4 ${getBorderClass(activity.type)} pl-3 py-2`}>
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.description} • {activity.time}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
