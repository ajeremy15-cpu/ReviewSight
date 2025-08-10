import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/auth/auth-context";
import CreatorCard from "@/components/creators/creator-card";
import { Users, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Creators() {
  const { toast } = useToast();
  const { user, organizations } = useAuth();
  const orgId = organizations?.[0]?.id;
  const [filters, setFilters] = useState({
    niches: "",
    location: "",
    minFollowers: "",
    minBrandFit: "",
  });

  const { data: creatorsData, isLoading } = useQuery({
    queryKey: ["/api/creators", filters],
  });

  const { data: shortlistData } = useQuery({
    queryKey: ["/api/shortlist", orgId],
    enabled: !!orgId && user?.role === 'OWNER',
  });

  const shortlistMutation = useMutation({
    mutationFn: async ({ creatorId, action }: { creatorId: string; action: 'add' | 'remove' }) => {
      const method = action === 'add' ? 'POST' : 'DELETE';
      const response = await fetch(`/api/shortlist/${orgId}/${creatorId}`, {
        method,
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to update shortlist');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shortlist", orgId] });
      toast({
        title: "Shortlist updated",
        description: "Creator shortlist has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update shortlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const creators = creatorsData?.creators || [];
  const shortlisted = shortlistData?.shortlisted || [];
  const shortlistedIds = new Set(shortlisted.map((c: any) => c.id));

  const handleShortlist = (creatorId: string, isShortlisted: boolean) => {
    shortlistMutation.mutate({
      creatorId,
      action: isShortlisted ? 'remove' : 'add',
    });
  };

  if (user?.role === 'CREATOR') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Creator Profile</h1>
          <p className="text-slate-600">Manage your creator profile and social media stats</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Setup Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              Creator profile management is currently being developed. You'll be able to:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-slate-600">
              <li>Update your display name and bio</li>
              <li>Add social media links</li>
              <li>Enter follower and engagement statistics</li>
              <li>Specify your content niches</li>
              <li>View brand collaboration opportunities</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Creator Marketplace</h1>
        <p className="text-slate-600">Find and connect with content creators that match your brand</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Niche</label>
              <Select
                value={filters.niches}
                onValueChange={(value) => setFilters(prev => ({ ...prev, niches: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Niches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Niches</SelectItem>
                  <SelectItem value="travel">Travel & Tourism</SelectItem>
                  <SelectItem value="food">Food & Dining</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
              <Select
                value={filters.location}
                onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Locations</SelectItem>
                  <SelectItem value="Caribbean">Caribbean</SelectItem>
                  <SelectItem value="Jamaica">Jamaica</SelectItem>
                  <SelectItem value="Barbados">Barbados</SelectItem>
                  <SelectItem value="Bahamas">Bahamas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Min Followers</label>
              <Select
                value={filters.minFollowers}
                onValueChange={(value) => setFilters(prev => ({ ...prev, minFollowers: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="1000">1K+</SelectItem>
                  <SelectItem value="10000">10K+</SelectItem>
                  <SelectItem value="100000">100K+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Brand Fit Score</label>
              <Select
                value={filters.minBrandFit}
                onValueChange={(value) => setFilters(prev => ({ ...prev, minBrandFit: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Scores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Scores</SelectItem>
                  <SelectItem value="90">90+ (Excellent)</SelectItem>
                  <SelectItem value="70">70+ (Good)</SelectItem>
                  <SelectItem value="50">50+ (Fair)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Creators Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-24"></div>
                      <div className="h-3 bg-slate-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                  </div>
                  <div className="flex space-x-2 mb-4">
                    <div className="h-6 bg-slate-200 rounded w-16"></div>
                    <div className="h-6 bg-slate-200 rounded w-16"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="h-8 bg-slate-200 rounded"></div>
                    <div className="h-8 bg-slate-200 rounded"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-slate-200 rounded flex-1"></div>
                    <div className="h-8 bg-slate-200 rounded flex-1"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : creators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((creator: any) => (
            <CreatorCard
              key={creator.id}
              creator={creator}
              isShortlisted={shortlistedIds.has(creator.id)}
              onShortlist={(isShortlisted) => handleShortlist(creator.id, isShortlisted)}
              loading={shortlistMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No creators found</h3>
            <p className="text-slate-500">
              Try adjusting your search filters to find creators that match your criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
