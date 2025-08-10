import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/auth-context";
import ReviewFilters from "@/components/reviews/review-filters";
import ReviewCard from "@/components/reviews/review-card";
import { Search, Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Reviews() {
  const { toast } = useToast();
  const { organizations } = useAuth();
  const orgId = organizations?.[0]?.id;
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});

  const { data: reviewsData, isLoading, refetch } = useQuery({
    queryKey: ["/api/reviews", orgId, filters],
    enabled: !!orgId,
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !orgId) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/reviews/${orgId}/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Upload successful",
          description: result.message,
        });
        refetch();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your CSV file.",
        variant: "destructive",
      });
    }

    // Reset file input
    event.target.value = '';
  };

  const reviews = reviewsData?.reviews || [];
  const filteredReviews = reviews.filter((review: any) =>
    searchQuery === "" || 
    review.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Reviews</h1>
        <p className="text-slate-600">Search and analyze all customer feedback</p>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <div className="w-80">
          <ReviewFilters onFiltersChange={setFilters} />
        </div>

        {/* Reviews List */}
        <div className="flex-1">
          {/* Search Bar and Upload */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 mr-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search reviews..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <Button asChild>
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload CSV
                    </label>
                  </Button>
                </div>
              </div>
              <div className="text-sm text-slate-600">
                Showing <span className="font-medium">1-{Math.min(10, filteredReviews.length)}</span> of{" "}
                <span className="font-medium">{filteredReviews.length}</span> reviews
              </div>
            </CardContent>
          </Card>

          {/* Reviews Results */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="h-4 bg-slate-200 rounded w-20"></div>
                        <div className="h-4 bg-slate-200 rounded w-24"></div>
                        <div className="h-4 bg-slate-200 rounded w-16"></div>
                      </div>
                      <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
                      <div className="flex space-x-2">
                        <div className="h-6 bg-slate-200 rounded w-16"></div>
                        <div className="h-6 bg-slate-200 rounded w-16"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map((review: any) => (
                <ReviewCard key={review.id} review={review} detailed={true} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No reviews found</h3>
                <p className="text-slate-500 mb-4">
                  {searchQuery || Object.keys(filters).length > 0
                    ? "Try adjusting your search terms or filters."
                    : "Upload a CSV file or connect review sources to get started."}
                </p>
                {!searchQuery && Object.keys(filters).length === 0 && (
                  <div>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="empty-csv-upload"
                    />
                    <Button asChild>
                      <label htmlFor="empty-csv-upload" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Reviews CSV
                      </label>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {filteredReviews.length > 10 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-slate-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{Math.min(10, filteredReviews.length)}</span> of{" "}
                <span className="font-medium">{filteredReviews.length}</span> results
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button size="sm">1</Button>
                <Button variant="outline" size="sm">2</Button>
                <Button variant="outline" size="sm">3</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
