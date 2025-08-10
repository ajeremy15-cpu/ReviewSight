import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink } from "lucide-react";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    text: string;
    author?: string;
    createdAt: string;
    source: {
      name: string;
    };
    aspects?: Array<{
      aspect: string;
      sentiment: 'NEG' | 'NEUTRAL' | 'POS';
      score: number;
    }>;
  };
  detailed?: boolean;
  className?: string;
}

const aspectLabels = {
  CLEANLINESS: 'Cleanliness',
  STAFF: 'Staff',
  FOOD_QUALITY: 'Food Quality',
  VALUE: 'Value',
  LOCATION: 'Location',
  SPEED: 'Speed',
};

const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case 'POS':
      return 'bg-emerald-100 text-emerald-800';
    case 'NEG':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

export default function ReviewCard({ review, detailed = false, className = "" }: ReviewCardProps) {
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-slate-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <Card className={`hover:shadow-sm transition-shadow ${className}`}>
      <CardContent className={detailed ? "p-6" : "p-4"}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex">
              {renderStars(review.rating)}
            </div>
            <span className="text-sm text-slate-500 font-medium">
              {review.source.name}
            </span>
            <span className="text-sm text-slate-500">
              {formatDate(review.createdAt)}
            </span>
          </div>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-500 p-1">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-slate-900 mb-3 leading-relaxed">
          {detailed ? review.text : review.text.slice(0, 200) + (review.text.length > 200 ? '...' : '')}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {review.aspects?.map((aspect, index) => (
              <Badge
                key={index}
                className={`text-xs ${getSentimentColor(aspect.sentiment)}`}
                variant="secondary"
              >
                {aspectLabels[aspect.aspect as keyof typeof aspectLabels] || aspect.aspect}
              </Badge>
            ))}
          </div>
          {review.author && (
            <span className="text-xs text-slate-500">
              by {review.author}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
