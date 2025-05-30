import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Clock, Phone, Mail, Calendar } from "lucide-react";
import { Link } from "wouter";

interface Professional {
  id: number;
  firstName: string;
  lastName: string;
  businessName: string;
  professionalType: string;
  bio: string;
  specializations: string[];
  address: string;
  phoneNumber: string;
  email: string;
  profileImageUrl: string;
  averageRating: number;
  totalReviews: number;
  allowAppointmentBooking: boolean;
}

export default function ProfessionalDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ["/api/professionals/search", { searchTerm, type: selectedType }],
    enabled: true,
  });

  // Mock data for now since the API endpoint doesn't exist yet
  const mockProfessionals: Professional[] = [
    {
      id: 1,
      firstName: "Dr. Ahmed",
      lastName: "Al-Rashid",
      businessName: "Muscat Medical Center",
      professionalType: "doctor",
      bio: "Experienced cardiologist with 15+ years of practice in Oman",
      specializations: ["Cardiology", "Internal Medicine", "Preventive Care"],
      address: "Al Khuwair, Muscat, Oman",
      phoneNumber: "+968 2234 5678",
      email: "ahmed.rashid@medical.om",
      profileImageUrl: "",
      averageRating: 4.8,
      totalReviews: 127,
      allowAppointmentBooking: true,
    },
    {
      id: 2,
      firstName: "Fatima",
      lastName: "Al-Zahra",
      businessName: "Legal Consultancy Oman",
      professionalType: "lawyer",
      bio: "Corporate law specialist focusing on business formation and compliance",
      specializations: ["Corporate Law", "Business Formation", "Contract Law"],
      address: "Ruwi, Muscat, Oman",
      phoneNumber: "+968 2445 6789",
      email: "fatima.zahra@legal.om",
      profileImageUrl: "",
      averageRating: 4.9,
      totalReviews: 89,
      allowAppointmentBooking: true,
    },
  ];

  const displayProfessionals = Array.isArray(professionals) && professionals.length > 0 ? professionals as Professional[] : mockProfessionals;

  const professionalTypes = [
    "doctor", "dentist", "therapist", "consultant", "lawyer", 
    "accountant", "coach", "tutor", "other"
  ];

  const filteredProfessionals = displayProfessionals.filter((prof: Professional) =>
    prof.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.specializations?.some((spec: string) => 
      spec.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              Professional Directory
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover and connect with trusted professionals in your area
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <Input
                placeholder="Search professionals, services, or specializations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedType === "" ? "default" : "outline"}
                onClick={() => setSelectedType("")}
                size="sm"
              >
                All
              </Button>
              {professionalTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  onClick={() => setSelectedType(type)}
                  size="sm"
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProfessionals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No professionals found matching your criteria.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search terms or filters.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfessionals.map((professional: Professional) => (
                <Card key={professional.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={professional.profileImageUrl} />
                        <AvatarFallback>
                          {professional.firstName[0]}{professional.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {professional.firstName} {professional.lastName}
                        </CardTitle>
                        {professional.businessName && (
                          <p className="text-sm text-muted-foreground">
                            {professional.businessName}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {professional.averageRating || "New"}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({professional.totalReviews || 0} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Badge variant="secondary" className="capitalize">
                      {professional.professionalType}
                    </Badge>
                    
                    {professional.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {professional.bio}
                      </p>
                    )}

                    {professional.specializations && professional.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {professional.specializations.slice(0, 3).map((spec, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {professional.specializations.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{professional.specializations.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="space-y-2 text-sm">
                      {professional.address && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{professional.address}</span>
                        </div>
                      )}
                      {professional.phoneNumber && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{professional.phoneNumber}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button asChild className="flex-1" size="sm">
                        <Link href={`/professional/${professional.id}`}>
                          View Profile
                        </Link>
                      </Button>
                      {professional.allowAppointmentBooking && (
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Book
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}