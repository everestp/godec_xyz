import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
//
interface AppCardProps {
  title: string;
  description: string;
  image: string;
  route: string;
  status?: "coming-soon" | "beta" | "live";
  category?: string;
}

export const AppCard = ({ title, description, image, route, status = "live", category }: AppCardProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (status === "live") {
      navigate(route);
    }
  };

  const isClickable = status === "live";

  return (
    <Card 
      className={`
        group relative overflow-hidden transition-all duration-300 transform 
        hover:scale-[1.02] hover:shadow-lg
        ${isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-60"}
      `}
      onClick={isClickable ? handleClick : undefined}
    >
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-border/50">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-foreground">
              {title}
            </h3>
            {category && (
              <Badge 
                variant="outline" 
                className="mt-1 border-primary/30 text-primary font-medium"
              >
                {category}
              </Badge>
            )}
          </div>
          {status !== "live" && (
            <Badge 
              variant={status === "beta" ? "default" : "secondary"}
              className="font-semibold"
            >
              {status === "beta" ? "Beta" : "Coming Soon"}
            </Badge>
          )}
        </div>
        
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 min-h-[60px]">
          {description}
        </p>

        <div className="flex items-center justify-between">
          <span className={`
            text-sm font-medium transition-colors duration-300
            ${isClickable ? "text-primary group-hover:underline" : "text-muted-foreground"}
          `}>
            {status === "live" ? "Explore Now" : status === "beta" ? "Try Beta" : "Coming Soon"}
          </span>
          <ArrowRight className={`
            w-5 h-5 transition-transform duration-300 
            ${isClickable ? "text-primary group-hover:translate-x-1" : "text-muted-foreground"}
          `} />
        </div>
      </div>
    </Card>
  );
};
