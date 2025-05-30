import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mic, Moon, Sun, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [location, setLocation] = useLocation();
  const { login, register, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  
  const isRegisterMode = location === "/register";
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    firstName: "",
    lastName: "",
    role: "standard",
    rememberMe: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already authenticated
  if (user) {
    setLocation("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return;
        }
        
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
        });
        
        toast({
          title: "Account created!",
          description: "You have successfully registered. Please sign in.",
        });
        
        setLocation("/login");
      } else {
        await login(formData.email, formData.password);
        
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        
        setLocation("/dashboard");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setError(error.message || `Failed to ${isRegisterMode ? 'register' : 'sign in'}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(""); // Clear error on input change
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      
      {/* Header with Logo and Theme Toggle */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            TaskFin
          </span>
        </Link>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="w-9 px-0"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>

      {/* Main Login Card */}
      <Card className="w-full max-w-md shadow-2xl border-slate-200 dark:border-slate-700">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your TaskFin account to access your voice-powered productivity tools
          </CardDescription>
          
          {/* Features Badge */}
          <div className="flex items-center justify-center space-x-2 pt-2">
            <Badge variant="secondary" className="text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Local Voice AI
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Complete Privacy
            </Badge>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={isSubmitting}
                required
                className="focus-ring"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={isSubmitting}
                required
                className="focus-ring"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => handleInputChange("rememberMe", !!checked)}
                  disabled={isSubmitting}
                />
                <Label 
                  htmlFor="rememberMe" 
                  className="text-sm font-normal cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
              
              <Button 
                variant="link" 
                className="px-0 h-auto text-sm"
                type="button"
                disabled={isSubmitting}
              >
                Forgot password?
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !formData.email || !formData.password}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-300 dark:border-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <span className="text-sm text-muted-foreground">
                Don't have an account?{" "}
              </span>
              <Button 
                variant="link" 
                className="px-0 h-auto text-sm font-medium"
                type="button"
                onClick={() => setLocation("/register")}
                disabled={isSubmitting}
              >
                Create Account
              </Button>
            </div>

            {/* Demo Credentials (for development) */}
            <div className="text-center">
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium">Demo Accounts:</p>
                <p>Standard: user@taskfin.local / password</p>
                <p>Pro: pro@taskfin.local / password</p>
                <p>Admin: admin@taskfin.local / password</p>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* Features Overview */}
      <div className="absolute bottom-6 left-6 right-6 text-center">
        <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Local STT/TTS Processing</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Zero Cloud Dependencies</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Complete Data Privacy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
