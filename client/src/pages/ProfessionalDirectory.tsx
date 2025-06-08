import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/ui/page-header';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/layout/Sidebar';
import { 
  Search, 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Clock, 
  Calendar,
  User,
  Plus,
  MessageCircle
} from 'lucide-react';

export default function ProfessionalDirectory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  
  const [newService, setNewService] = useState({
    type: '',
    title: '',
    description: '',
    location: '',
    contactInfo: '',
    hourlyRate: '',
    availability: ''
  });

  const [newRequest, setNewRequest] = useState({
    serviceId: 0,
    requestType: 'consultation',
    description: '',
    preferredDate: '',
    budget: ''
  });

  // Fetch professional services
  const { data: services, isLoading } = useQuery({
    queryKey: ['/api/professional-services'],
    queryFn: async () => {
      const response = await fetch('/api/professional-services');
      if (!response.ok) throw new Error('Failed to fetch services');
      return response.json();
    }
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: typeof newService) => {
      const response = await fetch('/api/professional-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...serviceData,
          hourlyRate: parseFloat(serviceData.hourlyRate) || 0
        })
      });
      if (!response.ok) throw new Error('Failed to create service');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/professional-services'] });
      setOpen(false);
      setNewService({ type: '', title: '', description: '', location: '', contactInfo: '', hourlyRate: '', availability: '' });
      toast({ title: "Service created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create service", variant: "destructive" });
    }
  });

  // Create service request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (requestData: typeof newRequest) => {
      const response = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...requestData,
          budget: parseFloat(requestData.budget) || 0
        })
      });
      if (!response.ok) throw new Error('Failed to create request');
      return response.json();
    },
    onSuccess: () => {
      setRequestOpen(false);
      setNewRequest({ serviceId: 0, requestType: 'consultation', description: '', preferredDate: '', budget: '' });
      toast({ title: "Service request submitted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to submit request", variant: "destructive" });
    }
  });

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.type || !newService.title || !newService.description) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    createServiceMutation.mutate(newService);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.description) {
      toast({ title: "Please provide a description", variant: "destructive" });
      return;
    }
    createRequestMutation.mutate(newRequest);
  };

  // Filter services
  const filteredServices = services?.filter((service: any) => {
    const matchesSearch = service.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || service.type === typeFilter;
    const matchesLocation = !locationFilter || service.location?.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesType && matchesLocation;
  }) || [];

  const serviceTypes = [
    'therapy', 'legal', 'financial', 'medical', 'education', 'consulting', 'technical'
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar className="w-64 border-r" />
        <div className="flex-1 overflow-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar className="w-64 border-r" />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <PageHeader
            title="Professional Directory"
            description="Find and connect with professional service providers"
          >
            <div className="flex gap-2">
              <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Request Service
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request a Service</DialogTitle>
                    <DialogDescription>
                      Submit a request for professional services.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateRequest} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="requestType">Service Type</Label>
                      <Select value={newRequest.requestType} onValueChange={(value) => setNewRequest({ ...newRequest, requestType: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consultation">Consultation</SelectItem>
                          <SelectItem value="project">Project Work</SelectItem>
                          <SelectItem value="ongoing">Ongoing Support</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what you need..."
                        value={newRequest.description}
                        onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="preferredDate">Preferred Date</Label>
                        <Input
                          id="preferredDate"
                          type="date"
                          value={newRequest.preferredDate}
                          onChange={(e) => setNewRequest({ ...newRequest, preferredDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="budget">Budget</Label>
                        <Input
                          id="budget"
                          type="number"
                          placeholder="0.00"
                          value={newRequest.budget}
                          onChange={(e) => setNewRequest({ ...newRequest, budget: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={createRequestMutation.isPending}>
                      {createRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Professional Service</DialogTitle>
                    <DialogDescription>
                      List your professional service for others to find.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateService} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Service Type</Label>
                      <Select value={newService.type} onValueChange={(value) => setNewService({ ...newService, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Service Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Licensed Therapist, Financial Advisor"
                        value={newService.title}
                        onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your services and expertise..."
                        value={newService.description}
                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          placeholder="City, State"
                          value={newService.location}
                          onChange={(e) => setNewService({ ...newService, location: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          placeholder="0.00"
                          value={newService.hourlyRate}
                          onChange={(e) => setNewService({ ...newService, hourlyRate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactInfo">Contact Information</Label>
                      <Input
                        id="contactInfo"
                        placeholder="Email or phone number"
                        value={newService.contactInfo}
                        onChange={(e) => setNewService({ ...newService, contactInfo: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="availability">Availability</Label>
                      <Textarea
                        id="availability"
                        placeholder="e.g., Mon-Fri 9AM-5PM, Weekends by appointment"
                        value={newService.availability}
                        onChange={(e) => setNewService({ ...newService, availability: e.target.value })}
                      />
                    </div>
                    <Button type="submit" disabled={createServiceMutation.isPending}>
                      {createServiceMutation.isPending ? "Creating..." : "Create Service"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </PageHeader>

          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full sm:w-[200px]"
              />
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No services found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || typeFilter !== 'all' || locationFilter
                      ? 'Try adjusting your search filters.'
                      : 'Be the first to add a professional service.'}
                  </p>
                  <Button onClick={() => setOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                </div>
              ) : (
                filteredServices.map((service: any) => (
                  <Card key={service.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {service.title?.charAt(0) || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{service.title}</CardTitle>
                            <Badge variant="secondary" className="mt-1">
                              {service.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {service.description}
                      </p>
                      
                      <div className="space-y-2">
                        {service.location && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{service.location}</span>
                          </div>
                        )}
                        
                        {service.hourlyRate > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>${service.hourlyRate}/hour</span>
                          </div>
                        )}
                        
                        {service.contactInfo && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{service.contactInfo}</span>
                          </div>
                        )}
                      </div>

                      {service.availability && (
                        <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          <strong>Availability:</strong> {service.availability}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setNewRequest({ ...newRequest, serviceId: service.id });
                            setRequestOpen(true);
                          }}
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Contact
                        </Button>
                        <Button size="sm" variant="outline">
                          <Calendar className="w-4 h-4 mr-1" />
                          Schedule
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}