import bcrypt from "bcrypt";
import { storage } from "../storage";
import type { User, Organization } from "@shared/schema";

export interface LoginResult {
  success: boolean;
  user?: User;
  organizations?: Organization[];
  error?: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: "OWNER" | "CREATOR";
  organizationName?: string;
}

export interface SignupResult {
  success: boolean;
  user?: User;
  organization?: Organization;
  error?: string;
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResult> {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return { success: false, error: "Invalid credentials" };
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return { success: false, error: "Invalid credentials" };
      }

      const organizations = await storage.getUserOrganizations(user.id);

      return {
        success: true,
        user,
        organizations,
      };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Login failed" };
    }
  }

  async signup(data: SignupData): Promise<SignupResult> {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return { success: false, error: "User already exists with this email" };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 10);

      // Create user
      const user = await storage.createUser({
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
      });

      let organization: Organization | undefined;

      // Create organization if user is an owner
      if (data.role === "OWNER" && data.organizationName) {
        const slug = data.organizationName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        organization = await storage.createOrganization(
          {
            name: data.organizationName,
            slug,
          },
          user.id
        );
      }

      return {
        success: true,
        user,
        organization,
      };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: "Failed to create account" };
    }
  }

  async demoLogin(): Promise<LoginResult> {
    try {
      // Find the demo user (you can adjust this logic based on your needs)
      const demoUser = await storage.getUserByEmail("demo@bluelagoonhotel.com");
      if (!demoUser) {
        return { success: false, error: "Demo user not found" };
      }

      const organizations = await storage.getUserOrganizations(demoUser.id);

      return {
        success: true,
        user: demoUser,
        organizations,
      };
    } catch (error) {
      console.error("Demo login error:", error);
      return { success: false, error: "Demo login failed" };
    }
  }
}

export const authService = new AuthService();