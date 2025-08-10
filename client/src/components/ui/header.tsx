import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChartLine, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-context";

export function Header() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const isActive = (path: string) => location === path;

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <ChartLine className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">ReviewScope</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={`text-sm font-medium transition-colors ${
                    isActive("/dashboard") 
                      ? "text-blue-600" 
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/reviews" 
                  className={`text-sm font-medium transition-colors ${
                    isActive("/reviews") 
                      ? "text-blue-600" 
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  Reviews
                </Link>
                {user.role === "OWNER" && (
                  <Link 
                    href="/creators" 
                    className={`text-sm font-medium transition-colors ${
                      isActive("/creators") 
                        ? "text-blue-600" 
                        : "text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    Creators
                  </Link>
                )}
                <Link 
                  href="/training" 
                  className={`text-sm font-medium transition-colors ${
                    isActive("/training") 
                      ? "text-blue-600" 
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  Training
                </Link>
                <Link 
                  href="/settings" 
                  className={`text-sm font-medium transition-colors ${
                    isActive("/settings") 
                      ? "text-blue-600" 
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  Settings
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="ml-4"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth" 
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link href="/auth">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {user ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className={`text-sm font-medium ${
                      isActive("/dashboard") 
                        ? "text-blue-600" 
                        : "text-gray-700"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/reviews" 
                    className={`text-sm font-medium ${
                      isActive("/reviews") 
                        ? "text-blue-600" 
                        : "text-gray-700"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Reviews
                  </Link>
                  {user.role === "OWNER" && (
                    <Link 
                      href="/creators" 
                      className={`text-sm font-medium ${
                        isActive("/creators") 
                          ? "text-blue-600" 
                          : "text-gray-700"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Creators
                    </Link>
                  )}
                  <Link 
                    href="/training" 
                    className={`text-sm font-medium ${
                      isActive("/training") 
                        ? "text-blue-600" 
                        : "text-gray-700"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Training
                  </Link>
                  <Link 
                    href="/settings" 
                    className={`text-sm font-medium ${
                      isActive("/settings") 
                        ? "text-blue-600" 
                        : "text-gray-700"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="w-fit"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link 
                    href="/auth" 
                    className="text-sm font-medium text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link href="/auth">
                    <Button size="sm" onClick={() => setIsMenuOpen(false)}>
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}