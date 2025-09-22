import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { generateTripPDF, shareItinerary } from '@/utils/pdfExport';
import { 
  MapPin, Clock, DollarSign, Users, Download, Share2, 
  ArrowLeft, Calendar, Utensils, Camera, Info,
  Globe, Star, Navigation, Phone, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Activity {
  time: string;
  title: string;
  description: string;
  duration: string;
  cost: string;
  type: 'attraction' | 'restaurant' | 'activity' | 'transport';
  rating?: number;
}

interface DayPlan {
  day: number;
  date: string;
  theme: string;
  activities: Activity[];
  totalCost: string;
}

export default function ItineraryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(true);
  const [itinerary, setItinerary] = useState<DayPlan[] | null>(null);

  const formData = location.state?.formData || JSON.parse(sessionStorage.getItem('travelgenius_form_data') || 'null');

  useEffect(() => {
    if (!formData) {
      navigate('/');
      return;
    }

    // Generate itinerary using backend API
    const generateItinerary = async () => {
      try {
        const response = await apiService.generateTrip({
          destination: formData.destination,
          startDate: formData.startDate,
          endDate: formData.endDate,
          budget: formData.budget ? parseInt(formData.budget) : undefined,
          travelers: parseInt(formData.travelers),
          interests: formData.interests
        });

        if (response.success && response.itinerary) {
          setItinerary(response.itinerary);
        } else {
          console.error('Failed to generate trip:', response.message);
          // Fallback to show error or redirect
          navigate('/');
        }
      } catch (error) {
        console.error('Trip generation error:', error);
        // Fallback to show error or redirect
        navigate('/');
      } finally {
        setIsGenerating(false);
        // Clear session storage after using form data
        sessionStorage.removeItem('travelgenius_form_data');
      }
    };

    generateItinerary();
  }, [formData, navigate]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return <Utensils className="h-4 w-4" />;
      case 'attraction': return <Camera className="h-4 w-4" />;
      case 'transport': return <Navigation className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'restaurant': return 'bg-sunset-100 text-sunset-700';
      case 'attraction': return 'bg-travel-100 text-travel-700';
      case 'transport': return 'bg-gray-100 text-gray-700';
      default: return 'bg-purple-100 text-purple-700';
    }
  };

  if (!formData) return null;

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-travel-50 via-white to-sunset-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-r from-travel-500 to-sunset-500 rounded-full flex items-center justify-center mx-auto">
            <Globe className="h-8 w-8 text-white animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Creating Your Perfect Itinerary</h2>
            <p className="text-gray-600">Our AI is analyzing the best attractions, restaurants, and experiences for {formData.destination}...</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 w-2 bg-travel-500 rounded-full animate-bounce"></div>
              <div className="h-2 w-2 bg-sunset-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="h-2 w-2 bg-travel-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-travel-50 via-white to-sunset-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Planning
              </Button>
              <div className="flex items-center space-x-2">
                <Globe className="h-6 w-6 text-travel-500" />
                <span className="text-xl font-bold bg-gradient-to-r from-travel-600 to-sunset-600 bg-clip-text text-transparent">
                  TravelGenius
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (itinerary && formData) {
                    shareItinerary({
                      destination: formData.destination,
                      startDate: formData.startDate,
                      endDate: formData.endDate,
                      duration: itinerary.length,
                      cost: itinerary.reduce((sum, day) => sum + parseInt(day.totalCost.replace('$', '')), 0),
                      travelers: parseInt(formData.travelers),
                      interests: formData.interests,
                      itinerary
                    });
                  }
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-travel-500 to-sunset-500 hover:from-travel-600 hover:to-sunset-600"
                onClick={() => {
                  if (itinerary && formData) {
                    generateTripPDF({
                      destination: formData.destination,
                      startDate: formData.startDate,
                      endDate: formData.endDate,
                      duration: itinerary.length,
                      cost: itinerary.reduce((sum, day) => sum + parseInt(day.totalCost.replace('$', '')), 0),
                      travelers: parseInt(formData.travelers),
                      interests: formData.interests,
                      itinerary
                    });
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Trip Overview Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-travel-500" />
                  Trip Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{formData.destination}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formData.startDate} - {formData.endDate}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {formData.travelers} travelers
                    </div>
                    {formData.budget && (
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        ${formData.budget} budget
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Your Interests</h4>
                  <div className="flex flex-wrap gap-1">
                    {formData.interests.map((interest: string) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Cost</span>
                    <span className="font-semibold">
                      ${itinerary?.reduce((sum, day) => sum + parseInt(day.totalCost.replace('$', '')), 0) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cost per person</span>
                    <span className="font-semibold">
                      ${Math.round((itinerary?.reduce((sum, day) => sum + parseInt(day.totalCost.replace('$', '')), 0) || 0) / parseInt(formData.travelers))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trip Duration</span>
                    <span className="font-semibold">{itinerary?.length || 0} days</span>
                  </div>
                </div>

                <Button className="w-full mt-4 bg-gradient-to-r from-travel-500 to-sunset-500 hover:from-travel-600 hover:to-sunset-600">
                  <Phone className="h-4 w-4 mr-2" />
                  Book with Expert
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Itinerary Content */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your {formData.destination} Itinerary</h1>
              <p className="text-gray-600">Personalized recommendations based on your preferences</p>
            </div>

            <Tabs defaultValue="itinerary" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="itinerary">Day-by-Day</TabsTrigger>
                <TabsTrigger value="tips">Local Tips</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
              </TabsList>

              <TabsContent value="itinerary" className="space-y-6">
                {itinerary?.map((day) => (
                  <Card key={day.day} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-travel-500/10 to-sunset-500/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl">Day {day.day}</CardTitle>
                          <CardDescription className="text-base font-medium text-gray-700 mt-1">
                            {day.theme}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">{day.date}</div>
                          <div className="text-lg font-semibold text-travel-600">{day.totalCost}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        {day.activities.map((activity, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                                {activity.time.split(' ')[0]}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">{activity.title}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className={`text-xs ${getActivityColor(activity.type)}`}>
                                      {getActivityIcon(activity.type)}
                                      <span className="ml-1 capitalize">{activity.type}</span>
                                    </Badge>
                                    <div className="flex items-center text-sm text-gray-500">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {activity.duration}
                                    </div>
                                    <div className="text-sm font-medium text-gray-700">{activity.cost}</div>
                                    {activity.rating && (
                                      <div className="flex items-center text-sm text-yellow-600">
                                        <Star className="h-3 w-3 mr-1 fill-current" />
                                        {activity.rating}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-600 leading-relaxed">{activity.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="tips" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Info className="h-5 w-5 mr-2 text-travel-500" />
                      Essential Local Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">🚇 Transportation</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>• Get a Navigo day pass for unlimited metro/bus (€7.50)</li>
                          <li>• Metro runs 5:30 AM - 1:15 AM (2:15 AM Fri/Sat)</li>
                          <li>• Avoid rush hours: 7:30-9:30 AM, 5:30-7:30 PM</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">💰 Money Tips</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>• Most places accept cards, but carry some cash</li>
                          <li>• Tipping: 5-10% at restaurants if satisfied</li>
                          <li>• Many museums free first Sunday of month</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">🍽️ Food Culture</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>• Lunch: 12-2 PM, Dinner: 7:30-10 PM</li>
                          <li>• Boulangeries close mid-afternoon</li>
                          <li>• Say "Bonjour" when entering shops</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">⚠️ Safety</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>• Watch for pickpockets on metro and tourist areas</li>
                          <li>• Keep copies of important documents</li>
                          <li>• Emergency number: 112</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Trip Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none text-gray-600">
                      <p>
                        Your {itinerary?.length || 0}-day {formData.destination} adventure focuses on the perfect balance of iconic landmarks and local experiences.
                        We've curated activities that match your interests in {formData.interests.join(', ').toLowerCase()},
                        while keeping within your budget considerations.
                      </p>
                      <p className="mt-4">
                        This itinerary includes must-see attractions combined with authentic local experiences across different districts and neighborhoods.
                        Each day has a distinct theme to give you a comprehensive taste of local culture, history, and cuisine throughout your entire trip.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
