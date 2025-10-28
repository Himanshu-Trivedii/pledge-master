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
    <Card className="p-6 hover:border-gold hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/95 backdrop-blur-sm group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-2 text-foreground group-hover:text-gold transition-colors">
            {value}
          </h3>
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
        <div className="p-3 bg-gradient-to-br from-gold/20 to-gold/10 rounded-lg group-hover:scale-110 transition-transform shadow-lg">
          <Icon className="h-6 w-6 text-gold" />
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
