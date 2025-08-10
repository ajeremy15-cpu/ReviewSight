import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/auth/auth-context";
import { GraduationCap, Play, FileText, Download, Eye, Lightbulb, AlertTriangle, CheckCircle } from "lucide-react";

const categories = [
  { id: "Service Excellence", label: "Service Excellence" },
  { id: "Housekeeping", label: "Housekeeping" },
  { id: "Food & Beverage", label: "Food & Beverage" },
  { id: "Front Desk", label: "Front Desk" },
  { id: "Social Media", label: "Social Media" },
];

export default function Training() {
  const { organizations } = useAuth();
  const orgId = organizations?.[0]?.id;
  const [activeCategory, setActiveCategory] = useState("Service Excellence");

  const { data: trainingData, isLoading } = useQuery({
    queryKey: ["/api/training"],
  });

  const { data: recommendedData, isLoading: loadingRecommended } = useQuery({
    queryKey: ["/api/training/recommended", orgId],
    enabled: !!orgId,
  });

  const resources = trainingData?.resources || [];
  const recommended = recommendedData?.recommended || [];

  const filteredResources = resources.filter((resource: any) => 
    resource.category === activeCategory
  );

  const handleResourceClick = (resource: any) => {
    if (resource.url) {
      window.open(resource.url, '_blank');
    }
  };

  const getPriorityColor = (title: string) => {
    if (title.toLowerCase().includes('wait') || title.toLowerCase().includes('speed')) {
      return 'bg-red-100 text-red-800';
    }
    if (title.toLowerCase().includes('clean') || title.toLowerCase().includes('housekeeping')) {
      return 'bg-amber-100 text-amber-800';
    }
    return 'bg-emerald-100 text-emerald-800';
  };

  const getPriorityIcon = (title: string) => {
    if (title.toLowerCase().includes('wait') || title.toLowerCase().includes('speed')) {
      return <AlertTriangle className="h-4 w-4" />;
    }
    if (title.toLowerCase().includes('clean') || title.toLowerCase().includes('housekeeping')) {
      return <CheckCircle className="h-4 w-4" />;
    }
    return <Lightbulb className="h-4 w-4" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Training Library</h1>
        <p className="text-slate-600">Comprehensive training resources to improve your business operations</p>
      </div>

      {/* Recommended Section */}
      <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg p-6 mb-8 border border-primary-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
          <Lightbulb className="text-primary-600 h-5 w-5 mr-2" />
          Recommended for You
        </h2>
        <p className="text-slate-600 mb-6">Based on your recent review insights, we recommend these training modules:</p>
        
        {loadingRecommended ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="flex items-center mb-2 space-x-2">
                      <div className="h-5 bg-slate-200 rounded w-20"></div>
                      <div className="h-5 bg-slate-200 rounded w-12"></div>
                    </div>
                    <div className="h-5 bg-slate-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recommended.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-4">
            {recommended.slice(0, 3).map((resource: any) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <Badge className={`mr-2 ${getPriorityColor(resource.title)}`}>
                      HIGH PRIORITY
                    </Badge>
                    <Badge variant={resource.format === 'VIDEO' ? 'default' : 'secondary'}>
                      {resource.format}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{resource.title}</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    {resource.format === 'VIDEO' 
                      ? 'Learn effective strategies through video training.'
                      : 'Comprehensive guide with detailed procedures.'
                    }
                  </p>
                  <Button
                    variant="link"
                    className="text-primary-600 hover:text-primary-700 p-0 h-auto"
                    onClick={() => handleResourceClick(resource)}
                  >
                    {resource.format === 'VIDEO' ? 'Start Training →' : 'Read Guide →'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">No specific recommendations available yet.</p>
              <p className="text-sm text-slate-400">Upload reviews to get personalized training recommendations.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Category Tabs */}
      <Card>
        <CardHeader className="pb-0">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="grid w-full grid-cols-5">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent className="p-6">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="animate-pulse">
                      <div className="flex items-center justify-between mb-3">
                        <div className="h-5 bg-slate-200 rounded w-12"></div>
                        <div className="h-4 bg-slate-200 rounded w-16"></div>
                      </div>
                      <div className="h-5 bg-slate-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-full mb-1"></div>
                      <div className="h-3 bg-slate-200 rounded w-3/4 mb-4"></div>
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-slate-200 rounded w-20"></div>
                        <div className="h-4 bg-slate-200 rounded w-16"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredResources.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource: any) => (
                <Card key={resource.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleResourceClick(resource)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={resource.format === 'VIDEO' ? 'default' : 'secondary'}>
                        {resource.format}
                      </Badge>
                      <span className="text-sm text-slate-500">
                        {resource.format === 'VIDEO' ? '15 min' : '8 pages'}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-slate-900 mb-2">{resource.title}</h3>
                    
                    <p className="text-sm text-slate-600 mb-4">
                      {resource.markdown 
                        ? resource.markdown.split('\n')[0].replace('# ', '')
                        : `${resource.format === 'VIDEO' ? 'Video training' : 'Documentation'} for ${resource.category.toLowerCase()}`
                      }
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Button
                        variant="link"
                        className="text-primary-600 hover:text-primary-700 p-0 h-auto"
                      >
                        {resource.format === 'VIDEO' ? 'Watch Video' : 'Read Document'}
                      </Button>
                      <div className="flex items-center text-slate-500 text-sm">
                        {resource.format === 'VIDEO' ? (
                          <>
                            <Play className="h-3 w-3 mr-1" />
                            <span>2.3k views</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-3 w-3 mr-1" />
                            <span>1.8k downloads</span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No resources found</h3>
                <p className="text-slate-500">
                  Training resources for {activeCategory} are currently being updated.
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
