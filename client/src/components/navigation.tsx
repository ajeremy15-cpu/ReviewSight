import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/auth/auth-context";
import { useLocation } from "wouter";
import { ChartLine, Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location === path || location.startsWith(path + "/");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/reviews", label: "Reviews" },
    { path: "/creators", label: "Creators" },
    { path: "/training", label: "Training" },
  ];

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  // Don't show navigation on auth or landing pages
  if (location === "/" || location === "/auth") {
    return null;
  }

  // Don't show navigation if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <ChartLine className="text-primary-600 h-8 w-8 mr-3" />
              <span className="text-xl font-bold text-slate-900">ReviewScope</span>
            </div>
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className={`px-1 pt-1 pb-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive(item.path)
                      ? "text-primary-600 border-primary-600"
                      : "text-slate-500 hover:text-slate-700 border-transparent hover:border-slate-300"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-500">
              <Bell className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 pl-3 pr-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary-100 text-primary-700">
                      {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-slate-700 hidden sm:block">
                    {user.name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setLocation("/settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
