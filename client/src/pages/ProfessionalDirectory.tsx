import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Clock, 
  Calendar,
  User,
  GraduationCap,
  Award,
  Languages as LanguagesIcon,
  MessageCircle
} from 'lucide-react';

interface Professional {
  id: number;
  name: string;
  type: string;
  location: string;
  rating: number;
  reviews: number;
  experience: number;
  languages: string[];
  specialization: string;
  phone: string;
  email: string;
  workingHours: string;
  education: string;
  certifications: string[];
  consultationFee: number;
  avatar?: string;
  services: string[];
  onlineConsultation: boolean;
  inPersonConsultation: boolean;
}

const mockProfessionals: Professional[] = [
  {
    id: 1,
    name: "د. أحمد المحرزي",
    type: "doctor",
    location: "muscat",
    rating: 4.8,
    reviews: 127,
    experience: 15,
    languages: ["Arabic", "English"],
    specialization: "طب القلب",
    phone: "+968 9123 4567",
    email: "ahmed.almahrezi@example.om",
    workingHours: "الأحد - الخميس: 8:00 ص - 6:00 م",
    education: "جامعة السلطان قابوس - كلية الطب",
    certifications: ["البورد العماني في طب القلب", "زمالة الكلية الأمريكية لأطباء القلب"],
    consultationFee: 25,
    services: ["فحص القلب", "تخطيط القلب", "قسطرة القلب"],
    onlineConsultation: true,
    inPersonConsultation: true
  },
  {
    id: 2,
    name: "أ. فاطمة الزدجالية",
    type: "lawyer",
    location: "muscat",
    rating: 4.9,
    reviews: 89,
    experience: 12,
    languages: ["Arabic", "English"],
    specialization: "القانون التجاري",
    phone: "+968 9234 5678",
    email: "fatima.alzadjali@example.om",
    workingHours: "الأحد - الخميس: 9:00 ص - 5:00 م",
    education: "جامعة السلطان قابوس - كلية الحقوق",
    certifications: ["عضو نقابة المحامين العمانيين", "دبلوم التحكيم التجاري"],
    consultationFee: 30,
    services: ["استشارات قانونية", "صياغة العقود", "التقاضي"],
    onlineConsultation: true,
    inPersonConsultation: true
  },
  {
    id: 3,
    name: "م. سالم البلوشي",
    type: "engineer",
    location: "sohar",
    rating: 4.7,
    reviews: 64,
    experience: 10,
    languages: ["Arabic", "English"],
    specialization: "الهندسة المدنية",
    phone: "+968 9345 6789",
    email: "salem.albalushi@example.om",
    workingHours: "الأحد - الخميس: 7:00 ص - 4:00 م",
    education: "الجامعة الألمانية للتكنولوجيا في عمان",
    certifications: ["مهندس مدني معتمد", "إدارة المشاريع PMP"],
    consultationFee: 20,
    services: ["تصميم المباني", "إشراف التنفيذ", "استشارات هندسية"],
    onlineConsultation: false,
    inPersonConsultation: true
  },
  {
    id: 4,
    name: "د. مريم الهنائية",
    type: "dentist",
    location: "nizwa",
    rating: 4.6,
    reviews: 92,
    experience: 8,
    languages: ["Arabic", "English"],
    specialization: "طب الأسنان التجميلي",
    phone: "+968 9456 7890",
    email: "mariam.alhinai@example.om",
    workingHours: "السبت - الأربعاء: 10:00 ص - 7:00 م",
    education: "كلية طب الأسنان - جامعة السلطان قابوس",
    certifications: ["دبلوم طب الأسنان التجميلي", "شهادة زراعة الأسنان"],
    consultationFee: 15,
    services: ["تنظيف الأسنان", "تجميل الأسنان", "زراعة الأسنان"],
    onlineConsultation: true,
    inPersonConsultation: true
  }
];

export default function ProfessionalDirectory() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);

  const professionalTypes = [
    'doctor', 'lawyer', 'engineer', 'accountant', 'consultant', 
    'teacher', 'dentist', 'veterinarian', 'architect', 'therapist'
  ];

  const locations = [
    'muscat', 'salalah', 'nizwa', 'sur', 'sohar', 'rustaq', 
    'ibri', 'khasab', 'bahla', 'buraimi', 'adam', 'bidiyah'
  ];

  const filteredProfessionals = mockProfessionals.filter(professional => {
    const matchesSearch = professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professional.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || professional.type === selectedType;
    const matchesLocation = !selectedLocation || professional.location === selectedLocation;
    return matchesSearch && matchesType && matchesLocation;
  });

  const ProfessionalCard = ({ professional }: { professional: Professional }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={professional.avatar} alt={professional.name} />
            <AvatarFallback className="text-lg">
              {professional.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{professional.name}</CardTitle>
            <CardDescription className="mb-2">
              {t(`professionals.types.${professional.type}`)} • {professional.specialization}
            </CardDescription>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {t(`professionals.locations.${professional.location}`)}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {professional.rating} ({professional.reviews})
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {professional.experience} {t('professionals.experience')}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {professional.languages.map((lang, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {lang}
            </Badge>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <span className="font-medium">{professional.consultationFee} ر.ع</span>
            <span className="text-muted-foreground ml-1">/استشارة</span>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setSelectedProfessional(professional)}>
                {t('professionals.viewProfile')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={professional.avatar} alt={professional.name} />
                    <AvatarFallback>
                      {professional.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xl">{professional.name}</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      {t(`professionals.types.${professional.type}`)} • {professional.specialization}
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">{t('professionals.contactInfo')}</TabsTrigger>
                  <TabsTrigger value="services">{t('professionals.services')}</TabsTrigger>
                  <TabsTrigger value="booking">{t('professionals.bookAppointment')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{professional.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{professional.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{t(`professionals.locations.${professional.location}`)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{professional.workingHours}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>{professional.education}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <LanguagesIcon className="h-4 w-4" />
                        <span>{professional.languages.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        <span>{professional.rating}/5 ({professional.reviews} مراجعة)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      {t('professionals.certifications')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {professional.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="services" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">{t('professionals.services')}</h4>
                    <div className="grid gap-2">
                      {professional.services.map((service, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded">
                          <MessageCircle className="h-4 w-4" />
                          <span>{service}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={professional.onlineConsultation} 
                        readOnly 
                        className="rounded"
                      />
                      <span>{t('professionals.onlineConsultation')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={professional.inPersonConsultation} 
                        readOnly 
                        className="rounded"
                      />
                      <span>{t('professionals.inPersonConsultation')}</span>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded">
                    <div className="font-medium">{t('professionals.consultationFee')}</div>
                    <div className="text-2xl font-bold text-primary">
                      {professional.consultationFee} ر.ع
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="booking" className="space-y-4">
                  <div className="text-center p-8 border-2 border-dashed rounded-lg">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">
                      {t('professionals.bookAppointment')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      اختر الوقت المناسب لك من المواعيد المتاحة
                    </p>
                    <Button className="w-full">
                      {t('professionals.selectTimeSlot')}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">{t('professionals.title')}</h1>
        <p className="text-muted-foreground">{t('professionals.subtitle')}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('professionals.searchProfessionals')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder={t('professionals.filterByType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('common.all')}</SelectItem>
            {professionalTypes.map(type => (
              <SelectItem key={type} value={type}>
                {t(`professionals.types.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder={t('professionals.filterByLocation')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('common.all')}</SelectItem>
            {locations.map(location => (
              <SelectItem key={location} value={location}>
                {t(`professionals.locations.${location}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfessionals.length > 0 ? (
          filteredProfessionals.map(professional => (
            <ProfessionalCard key={professional.id} professional={professional} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">{t('professionals.noResults')}</h3>
            <p className="text-muted-foreground">{t('professionals.noProfessionals')}</p>
          </div>
        )}
      </div>
    </div>
  );
}