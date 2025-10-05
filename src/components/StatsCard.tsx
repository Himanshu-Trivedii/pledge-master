import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

const StatsCard = ({ title, value, icon: Icon, trend, trendUp }: StatsCardProps) => {
  return (
    <Card className="p-6 hover:border-gold transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-2 text-foreground">{value}</h3>
          {trend && (
            <p
              className={`text-sm mt-2 ${
                trendUp ? "text-success" : "text-destructive"
              }`}
            >
              {trend}
            </p>
          )}
        </div>
        <div className="p-3 bg-gold/10 rounded-lg">
          <Icon className="h-6 w-6 text-gold" />
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
