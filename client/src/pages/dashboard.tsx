import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth/auth-context";
import RatingChart from "@/components/charts/rating-chart";
import ReviewCard from "@/components/reviews/review-card";
import { Star, MessageSquare, Reply, Heart, TrendingUp, TrendingDown, Minus, Download } from "lucide-react";

export default function Dashboard() {
  const { user, organizations } = useAuth();
  const orgId = organizations?.[0]?.id;

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard", orgId],
    enabled: !!orgId,
  });

  const handleGenerateReport = async () => {
    if (!orgId) return;
    
    try {
      const response = await fetch(`/api/reports/${orgId}/weekly`, {
        credentials: "include",
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'weekly-report.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Failed to generate report:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96 mb-8" />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {};
  const recentReviews = dashboardData?.recentReviews || [];
  const keyAreas = dashboardData?.keyAreas || [];
  const ratingTrends = dashboardData?.ratingTrends || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {organizations?.[0]?.name || "Dashboard"}
        </h1>
        <p className="text-slate-600">Monitor your customer feedback and business performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Average Rating</p>
                <p className="text-3xl font-bold text-slate-900">{metrics.averageRating || 0}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <Star className="text-emerald-600 h-5 w-5" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="text-emerald-500 h-4 w-4 mr-1" />
              <span className="text-emerald-600 text-sm font-medium">+0.3 from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Reviews</p>
                <p className="text-3xl font-bold text-slate-900">{metrics.totalReviews || 0}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-lg">
                <MessageSquare className="text-primary-600 h-5 w-5" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="text-emerald-500 h-4 w-4 mr-1" />
              <span className="text-emerald-600 text-sm font-medium">+127 this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Response Rate</p>
                <p className="text-3xl font-bold text-slate-900">{metrics.responseRate || 0}%</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Reply className="text-purple-600 h-5 w-5" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="text-emerald-500 h-4 w-4 mr-1" />
              <span className="text-emerald-600 text-sm font-medium">+5% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Sentiment Score</p>
                <p className="text-3xl font-bold text-slate-900">+{metrics.sentimentScore || 0}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <Heart className="text-amber-600 h-5 w-5" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingDown className="text-red-500 h-4 w-4 mr-1" />
              <span className="text-red-600 text-sm font-medium">-0.05 from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rating Trends Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Rating Trends</CardTitle>
                <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
                  <option>Last 3 months</option>
                  <option>Last 6 months</option>
                  <option>Last year</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <RatingChart data={ratingTrends} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Areas for Development */}
        <Card>
          <CardHeader>
            <CardTitle>Key Areas for Development</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {keyAreas.length > 0 ? (
              keyAreas.slice(0, 3).map((area: any, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    area.severity === 'HIGH' ? 'bg-red-500' : 
                    area.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <div>
                    <p className="font-medium text-slate-900">{area.title}</p>
                    <p className="text-sm text-slate-600">{area.summary}</p>
                    <div className="flex items-center mt-1">
                      {area.severity === 'HIGH' ? (
                        <>
                          <TrendingDown className="text-red-500 h-3 w-3 mr-1" />
                          <span className="text-red-600 text-xs">Needs attention</span>
                        </>
                      ) : area.severity === 'MEDIUM' ? (
                        <>
                          <Minus className="text-amber-500 h-3 w-3 mr-1" />
                          <span className="text-amber-600 text-xs">Monitor closely</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="text-emerald-500 h-3 w-3 mr-1" />
                          <span className="text-emerald-600 text-xs">Improving</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 py-4">
                <p>No insights available yet.</p>
                <p className="text-sm">Upload reviews to generate insights.</p>
              </div>
            )}
            
            <Button 
              className="w-full mt-6" 
              onClick={handleGenerateReport}
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Weekly Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Latest Reviews */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Latest Reviews</CardTitle>
            <Button variant="link" onClick={() => window.location.href = "/reviews"}>
              View all reviews
            </Button>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-slate-200">
          {recentReviews.length > 0 ? (
            recentReviews.map((review: any) => (
              <ReviewCard key={review.id} review={review} />
            ))
          ) : (
            <div className="text-center text-slate-500 py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>No reviews found.</p>
              <p className="text-sm">Reviews will appear here once they're uploaded.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
