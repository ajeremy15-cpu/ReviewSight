import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/auth-context";
import { Header } from "@/components/ui/header";
import Landing from "@/pages/landing";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Reviews from "@/pages/reviews";
import Creators from "@/pages/creators";
import Training from "@/pages/training";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/reviews" component={Reviews} />
      <Route path="/creators" component={Creators} />
      <Route path="/training" component={Training} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <div className="min-h-screen bg-slate-50">
            <Header />
            <Router />
          </div>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
