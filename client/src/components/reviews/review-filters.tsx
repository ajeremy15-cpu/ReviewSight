import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";

interface ReviewFiltersProps {
  onFiltersChange: (filters: any) => void;
}

const aspectOptions = [
  { id: 'CLEANLINESS', label: 'Cleanliness' },
  { id: 'STAFF', label: 'Staff' },
  { id: 'FOOD_QUALITY', label: 'Food Quality' },
  { id: 'VALUE', label: 'Value' },
  { id: 'LOCATION', label: 'Location' },
  { id: 'SPEED', label: 'Speed' },
];

export default function ReviewFilters({ onFiltersChange }: ReviewFiltersProps) {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    ratings: [] as number[],
    sources: [] as string[],
    aspects: [] as string[],
    keyword: '',
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleRatingToggle = (rating: number) => {
    const newRatings = filters.ratings.includes(rating)
      ? filters.ratings.filter(r => r !== rating)
      : [...filters.ratings, rating];
    handleFilterChange('ratings', newRatings);
  };

  const handleSourceToggle = (source: string) => {
    const newSources = filters.sources.includes(source)
      ? filters.sources.filter(s => s !== source)
      : [...filters.sources, source];
    handleFilterChange('sources', newSources);
  };

  const handleAspectToggle = (aspect: string) => {
    const newAspects = filters.aspects.includes(aspect)
      ? filters.aspects.filter(a => a !== aspect)
      : [...filters.aspects, aspect];
    handleFilterChange('aspects', newAspects);
  };

  const clearFilters = () => {
    const emptyFilters = {
      dateFrom: '',
      dateTo: '',
      ratings: [],
      sources: [],
      aspects: [],
      keyword: '',
    };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const renderStars = (count: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < count ? 'text-yellow-400 fill-current' : 'text-slate-300'
        }`}
      />
    ));
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Date Range
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="text-sm"
            />
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Rating
          </Label>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center">
                <Checkbox
                  id={`rating-${rating}`}
                  checked={filters.ratings.includes(rating)}
                  onCheckedChange={() => handleRatingToggle(rating)}
                />
                <label
                  htmlFor={`rating-${rating}`}
                  className="ml-2 text-sm text-slate-700 flex items-center cursor-pointer"
                >
                  <div className="flex mr-2">
                    {renderStars(rating)}
                  </div>
                  {rating} star{rating !== 1 ? 's' : ''}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Source Filter */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Source
          </Label>
          <div className="space-y-2">
            {['Google Reviews', 'TripAdvisor', 'Yelp'].map((source) => (
              <div key={source} className="flex items-center">
                <Checkbox
                  id={`source-${source}`}
                  checked={filters.sources.includes(source)}
                  onCheckedChange={() => handleSourceToggle(source)}
                />
                <label
                  htmlFor={`source-${source}`}
                  className="ml-2 text-sm text-slate-700 cursor-pointer"
                >
                  {source}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Aspects Filter */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Aspects
          </Label>
          <div className="flex flex-wrap gap-2">
            {aspectOptions.map((aspect) => (
              <Button
                key={aspect.id}
                variant={filters.aspects.includes(aspect.id) ? "default" : "outline"}
                size="sm"
                onClick={() => handleAspectToggle(aspect.id)}
                className="text-xs"
              >
                {aspect.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Keyword Search */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Keywords
          </Label>
          <Input
            placeholder="Search review content..."
            value={filters.keyword}
            onChange={(e) => handleFilterChange('keyword', e.target.value)}
            className="text-sm"
          />
        </div>

        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full"
        >
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );
}
