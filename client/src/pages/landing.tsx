import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Brain, Users, GraduationCap, Star, MessageSquare, Heart, Reply } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Transform Customer Reviews into{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
                Actionable Insights
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              AI-powered review analytics platform that aggregates feedback from all sources, analyzes sentiment, 
              and provides actionable business intelligence to improve customer experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4"
                onClick={() => setLocation("/auth")}
              >
                Start Free Trial
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-4"
                onClick={() => setLocation("/dashboard")}
              >
                View Live Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Everything you need to understand your customers
            </h2>
            <p className="text-lg text-slate-600">
              Comprehensive review analytics platform designed for modern businesses
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="text-primary-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">AI-Powered Analysis</h3>
              <p className="text-slate-600">
                Advanced sentiment analysis across 6 key aspects: cleanliness, staff, food quality, value, location, and speed.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="text-purple-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Creator Marketplace</h3>
              <p className="text-slate-600">
                Connect with content creators and influencers with our intelligent brand-fit scoring algorithm.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="text-emerald-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Training Library</h3>
              <p className="text-slate-600">
                Comprehensive training resources with personalized recommendations based on your review insights.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="text-emerald-600 h-6 w-6" />
              </div>
              <div className="text-3xl font-bold text-slate-900">4.2</div>
              <div className="text-slate-600">Average Rating</div>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="text-primary-600 h-6 w-6" />
              </div>
              <div className="text-3xl font-bold text-slate-900">1,247</div>
              <div className="text-slate-600">Total Reviews</div>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Reply className="text-purple-600 h-6 w-6" />
              </div>
              <div className="text-3xl font-bold text-slate-900">87%</div>
              <div className="text-slate-600">Response Rate</div>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="text-amber-600 h-6 w-6" />
              </div>
              <div className="text-3xl font-bold text-slate-900">+0.74</div>
              <div className="text-slate-600">Sentiment Score</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
