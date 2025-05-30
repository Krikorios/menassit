import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  ArrowRight, 
  User, 
  Briefcase, 
  Calendar,
  Clock,
  MapPin,
  Phone,
  Users
} from "lucide-react";

export default function OnboardingPage() {
  const { user, updateProfile } = useAuth();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Professional profile fields
    businessName: "",
    bio: "",
    specializations: "",
    address: "",
    phoneNumber: "",
    allowAppointmentBooking: false,
    
    // Availability settings
    workingHours: {
      monday: { enabled: true, start: "09:00", end: "17:00" },
      tuesday: { enabled: true, start: "09:00", end: "17:00" },
      wednesday: { enabled: true, start: "09:00", end: "17:00" },
      thursday: { enabled: true, start: "09:00", end: "17:00" },
      friday: { enabled: true, start: "09:00", end: "17:00" },
      saturday: { enabled: false, start: "09:00", end: "17:00" },
      sunday: { enabled: false, start: "09:00", end: "17:00" },
    }
  });

  const totalSteps = user?.role === "pro" ? 3 : 2;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      await updateProfile({
        onboardingComplete: true,
        businessName: formData.businessName || null,
        bio: formData.bio || null,
        specializations: formData.specializations ? formData.specializations.split(',').map(s => s.trim()).join(',') : null,
        address: formData.address || null,
        phoneNumber: formData.phoneNumber || null,
        allowAppointmentBooking: formData.allowAppointmentBooking,
      });
      setLocation("/dashboard");
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to TaskFin AI Suite!</h2>
        <p className="text-muted-foreground">
          Let's set up your account to get the most out of your experience.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Overview</CardTitle>
          <CardDescription>Your account details and features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Account Type</span>
            <Badge variant={user?.role === "pro" ? "default" : "secondary"} className="capitalize">
              {user?.role}
            </Badge>
          </div>
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium">Available Features:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Task Management</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Financial Tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Voice Commands (Arabic/English)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">AI Insights</span>
              </div>
              {user?.role === "pro" && (
                <>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Professional Profiles</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Appointment Booking</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Professional Profile</h2>
        <p className="text-muted-foreground">
          Set up your professional information for better networking and discovery.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Help others find and connect with you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name (Optional)</Label>
            <Input
              id="businessName"
              placeholder="Your business or practice name"
              value={formData.businessName}
              onChange={(e) => handleInputChange("businessName", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell others about your expertise and services..."
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specializations">Specializations</Label>
            <Input
              id="specializations"
              placeholder="e.g., Cardiology, Tax Planning, Project Management (comma-separated)"
              value={formData.specializations}
              onChange={(e) => handleInputChange("specializations", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Your business address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                placeholder="+968 XXXX XXXX"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              />
            </div>
          </div>

          {user?.role === "pro" && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Appointment Booking</Label>
                <p className="text-sm text-muted-foreground">
                  Let clients book appointments with you online
                </p>
              </div>
              <Switch
                checked={formData.allowAppointmentBooking}
                onCheckedChange={(checked) => handleInputChange("allowAppointmentBooking", checked)}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Availability Settings</h2>
        <p className="text-muted-foreground">
          Set your working hours for appointment booking.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Working Hours</CardTitle>
          <CardDescription>Configure when clients can book appointments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(formData.workingHours).map(([day, settings]) => (
            <div key={day} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => 
                    handleInputChange("workingHours", {
                      ...formData.workingHours,
                      [day]: { ...settings, enabled: checked }
                    })
                  }
                />
                <span className="font-medium capitalize">{day}</span>
              </div>
              {settings.enabled && (
                <div className="flex items-center space-x-2">
                  <Input
                    type="time"
                    value={settings.start}
                    onChange={(e) => 
                      handleInputChange("workingHours", {
                        ...formData.workingHours,
                        [day]: { ...settings, start: e.target.value }
                      })
                    }
                    className="w-24"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={settings.end}
                    onChange={(e) => 
                      handleInputChange("workingHours", {
                        ...formData.workingHours,
                        [day]: { ...settings, end: e.target.value }
                      })
                    }
                    className="w-24"
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && user?.role === "pro" && renderStep3()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            
            {currentStep < totalSteps ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                Complete Setup
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}