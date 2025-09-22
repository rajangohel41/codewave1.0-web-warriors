import { useState } from 'react';
import { MapPin, Calendar, DollarSign, User, Sparkles, Globe, Plane, LogOut, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface TripFormData {
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  travelers: string;
  interests: string[];
}

const interestOptions = [
  'Food & Dining', 'History & Culture', 'Nature & Parks', 'Adventure Sports', 
  'Relaxation', 'Photography', 'Shopping', 'Nightlife', 'Museums', 'Architecture'
];

export default function Index() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState<TripFormData>({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    travelers: '',
    interests: []
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.destination || !formData.startDate || !formData.endDate) return;

    // Check if user is authenticated
    if (!user) {
      // Store form data in sessionStorage for after login
      sessionStorage.setItem('travelgenius_form_data', JSON.stringify(formData));
      navigate('/login', { state: { from: { pathname: '/itinerary' } } });
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Navigate to results with form data
    navigate('/itinerary', { state: { formData } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-travel-50 via-white to-sunset-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-travel-500/10 to-sunset-500/10" />
        
        {/* Header */}
        <header className="relative z-10 px-4 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-travel-500 to-sunset-500 rounded-xl">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-travel-600 to-sunset-600 bg-clip-text text-transparent">
                TravelGenius
              </span>
            </div>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard">
                  <Button variant="outline" className="border-travel-200 text-travel-700 hover:bg-travel-50">
                    My Dashboard
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-r from-travel-500 to-sunset-500 text-white">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <Users className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="outline" className="border-travel-200 text-travel-700 hover:bg-travel-50">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-travel-500 to-sunset-500 hover:from-travel-600 hover:to-sunset-600">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 px-4 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Hero Text */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-sunset-500" />
                    <span className="text-sunset-600 font-medium">AI-Powered Trip Planning</span>
                  </div>
                  <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                    Plan Your Perfect
                    <span className="block bg-gradient-to-r from-travel-600 to-sunset-600 bg-clip-text text-transparent">
                      Adventure
                    </span>
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Get personalized, day-by-day travel itineraries in seconds. 
                    Our AI creates detailed plans with attractions, restaurants, and insider tips.
                  </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-travel-100 rounded-lg">
                      <Plane className="h-5 w-5 text-travel-600" />
                    </div>
                    <span className="text-gray-700 font-medium">Instant Planning</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-sunset-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-sunset-600" />
                    </div>
                    <span className="text-gray-700 font-medium">Local Insights</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-travel-100 rounded-lg">
                      <DollarSign className="h-5 w-5 text-travel-600" />
                    </div>
                    <span className="text-gray-700 font-medium">Budget Friendly</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-sunset-100 rounded-lg">
                      <User className="h-5 w-5 text-sunset-600" />
                    </div>
                    <span className="text-gray-700 font-medium">Personalized</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Trip Planning Form */}
              <Card className="w-full shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl text-gray-900">Start Planning</CardTitle>
                  <CardDescription className="text-gray-600">
                    Tell us about your dream trip and we'll create the perfect itinerary
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Destination */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Where are you going?
                      </label>
                      <Input
                        placeholder="Enter destination (e.g., Paris, France)"
                        value={formData.destination}
                        onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                        className="border-gray-200 focus:border-travel-500"
                        required
                      />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Start Date
                        </label>
                        <Input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                          className="border-gray-200 focus:border-travel-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          End Date
                        </label>
                        <Input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                          className="border-gray-200 focus:border-travel-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Budget & Travelers */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Budget (USD)
                        </label>
                        <Input
                          placeholder="e.g., 1500"
                          value={formData.budget}
                          onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                          className="border-gray-200 focus:border-travel-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Travelers
                        </label>
                        <Input
                          placeholder='Number of travelers'
                          type="number"
                          min="1"
                          value={formData.travelers}
                          onChange={(e) => setFormData(prev => ({ ...prev, travelers: e.target.value }))}
                          className="border-gray-200 focus:border-travel-500"
                        />
                      </div>
                    </div>

                    {/* Interests */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        What interests you?
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {interestOptions.map((interest) => (
                          <Badge
                            key={interest}
                            variant={formData.interests.includes(interest) ? "default" : "outline"}
                            className={`cursor-pointer justify-center py-2 transition-all ${
                              formData.interests.includes(interest)
                                ? 'bg-gradient-to-r from-travel-500 to-sunset-500 hover:from-travel-600 hover:to-sunset-600'
                                : 'hover:bg-gray-100'
                            }`}
                            onClick={() => handleInterestToggle(interest)}
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-travel-500 to-sunset-500 hover:from-travel-600 hover:to-sunset-600 text-white py-6 text-lg font-semibold"
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Generating Your Perfect Trip...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Sparkles className="h-5 w-5 mr-2" />
                          Generate My Itinerary
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Features Section */}
      <div className="px-4 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose TravelGenius?
            </h2>
            <p className="text-lg text-gray-600">
              Experience the future of travel planning with our AI-powered assistant
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-travel-500 to-sunset-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Results</h3>
              <p className="text-gray-600">Get detailed itineraries in seconds, not hours</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-travel-500 to-sunset-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Local Expertise</h3>
              <p className="text-gray-600">Discover hidden gems and local favorites</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-travel-500 to-sunset-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized</h3>
              <p className="text-gray-600">Tailored to your interests and budget</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
