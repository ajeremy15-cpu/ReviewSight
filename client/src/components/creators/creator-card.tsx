import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiInstagram, SiFacebook } from "react-icons/si";
import { ExternalLink } from "lucide-react";

interface CreatorCardProps {
  creator: {
    id: string;
    displayName: string;
    bio: string;
    city: string;
    country: string;
    niches: string[];
    followers: number;
    engagementRate: number;
    instagramUrl?: string;
    facebookUrl?: string;
    tiktokUrl?: string;
    brandFitScore?: number;
  };
  isShortlisted: boolean;
  onShortlist: (isShortlisted: boolean) => void;
  loading?: boolean;
}

const calculateBrandFitScore = (creator: CreatorCardProps['creator']): number => {
  let score = 0;
  
  // Niche overlap (0-60 points)
  const hotelNiches = ["travel", "tourism", "luxury", "lifestyle"];
  const nicheOverlap = creator.niches?.filter((n: string) => 
    hotelNiches.some(hn => n.toLowerCase().includes(hn))
  ).length || 0;
  score += Math.min(nicheOverlap * 15, 60);
  
  // Location proximity (0-30 points) - Caribbean/Jamaica gets higher scores
  if (creator.country?.toLowerCase().includes('jamaica') || 
      creator.city?.toLowerCase().includes('caribbean')) {
    score += 30;
  } else if (creator.country?.toLowerCase().includes('caribbean')) {
    score += 20;
  } else {
    score += 10;
  }
  
  // Engagement threshold (bonus up to 10 points)
  const engagementRate = creator.engagementRate || 0;
  if (engagementRate > 8) score += 10;
  else if (engagementRate > 5) score += 7;
  else if (engagementRate > 3) score += 5;
  
  return Math.min(Math.round(score), 100);
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K';
  }
  return num.toString();
};

const getBrandFitColor = (score: number): string => {
  if (score >= 90) return 'bg-emerald-400';
  if (score >= 70) return 'bg-yellow-400';
  return 'bg-orange-400';
};

const getBrandFitTextColor = (score: number): string => {
  if (score >= 90) return 'text-emerald-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-orange-600';
};

export default function CreatorCard({ creator, isShortlisted, onShortlist, loading }: CreatorCardProps) {
  const brandFitScore = creator.brandFitScore || calculateBrandFitScore(creator);

  // Mock profile images based on creator data
  const getProfileImage = () => {
    if (creator.displayName?.includes('Maya')) {
      return 'https://images.unsplash.com/photo-1494790108755-2616b612b77c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=64&h=64';
    }
    if (creator.displayName?.includes('Marcus')) {
      return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=64&h=64';
    }
    if (creator.displayName?.includes('Sophia')) {
      return 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=64&h=64';
    }
    // Default avatar
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.displayName}`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <img 
            className="w-16 h-16 rounded-full object-cover"
            src={getProfileImage()}
            alt={creator.displayName}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.displayName}`;
            }}
          />
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">{creator.displayName}</h3>
            <p className="text-sm text-slate-600">{creator.city}, {creator.country}</p>
            <div className="flex items-center mt-1">
              <div className={`w-3 h-3 rounded-full mr-2 ${getBrandFitColor(brandFitScore)}`}></div>
              <span className={`text-lg font-bold ${getBrandFitTextColor(brandFitScore)}`}>
                {brandFitScore}
              </span>
              <span className="text-sm text-slate-600 ml-1">Brand Fit</span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-slate-600 mb-4 line-clamp-3">
          {creator.bio}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {creator.niches?.map((niche, index) => (
            <Badge 
              key={index}
              variant="secondary"
              className="text-xs capitalize"
            >
              {niche}
            </Badge>
          )) || []}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p className="text-slate-600">Followers</p>
            <p className="font-semibold text-slate-900">
              {formatNumber(creator.followers)}
            </p>
          </div>
          <div>
            <p className="text-slate-600">Engagement</p>
            <p className="font-semibold text-slate-900">
              {creator.engagementRate?.toFixed(1)}%
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3 mb-4">
          {creator.instagramUrl && (
            <a 
              href={creator.instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-700 transition-colors"
            >
              <SiInstagram className="h-5 w-5" />
            </a>
          )}
          {creator.facebookUrl && (
            <a 
              href={creator.facebookUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              <SiFacebook className="h-5 w-5" />
            </a>
          )}
          {creator.tiktokUrl && (
            <a 
              href={creator.tiktokUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-900 hover:text-slate-700 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button
            className={`flex-1 ${isShortlisted ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
            variant={isShortlisted ? "default" : "default"}
            onClick={() => onShortlist(isShortlisted)}
            disabled={loading}
          >
            {loading ? "..." : isShortlisted ? "Shortlisted" : "Shortlist"}
          </Button>
          <Button variant="outline" size="icon">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
