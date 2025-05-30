import { apiRequest } from "@/lib/queryClient";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface AuthResponse {
  message: string;
  user: any;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/login", { email, password });
    return response.json();
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    return response.json();
  },

  async logout(): Promise<void> {
    await apiRequest("POST", "/api/auth/logout");
  },

  async getCurrentUser(): Promise<any> {
    const response = await apiRequest("GET", "/api/auth/me");
    const data = await response.json();
    return data.user;
  },

  async updateProfile(updates: any): Promise<AuthResponse> {
    const response = await apiRequest("PUT", "/api/auth/profile", updates);
    return response.json();
  },

  async completeOnboarding(role: string, preferences?: any): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/complete-onboarding", {
      role,
      preferences,
    });
    return response.json();
  },
};
