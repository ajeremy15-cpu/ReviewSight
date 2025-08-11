import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "CREATOR";
}

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface AuthContextType {
  user: User | null;
  organizations: Organization[];
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role: "OWNER" | "CREATOR";
  organizationName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
  setLoading(true);
  try {
    await apiRequest("POST", "/api/auth/login", { email, password });
    await checkAuth(); // ensure header & tabs hydrate from session
  } finally {
    setLoading(false);
  }
};

const signup = async (data: SignupData) => {
  setLoading(true);
  try {
    await apiRequest("POST", "/api/auth/signup", data);
    await checkAuth();
  } finally {
    setLoading(false);
  }
};

const demoLogin = async () => {
  setLoading(true);
  try {
    await apiRequest("POST", "/api/auth/demo");
    await checkAuth();
  } finally {
    setLoading(false);
  }
};

const logout = async () => {
  setLoading(true);
  try {
    await apiRequest("POST", "/api/auth/logout");
    setUser(null);
    setOrganizations([]);
  } finally {
    setLoading(false);
  }
};

  return (
    <AuthContext.Provider
      value={{
        user,
        organizations,
        loading,
        login,
        signup,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
