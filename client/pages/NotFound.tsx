import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Map, Compass, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-travel-50 via-white to-sunset-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-travel-400/20 to-sunset-400/20 rounded-full blur-3xl float-animation"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-br from-sunset-400/20 to-travel-400/20 rounded-full blur-3xl float-animation" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-travel-300/15 to-sunset-300/15 rounded-full blur-2xl float-animation" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 text-center max-w-md w-full fade-in">
        {/* Lost traveler illustration */}
        <div className="mb-8">
          <div className="relative mx-auto w-32 h-32 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-travel-500 to-sunset-500 rounded-full opacity-20 scale-110 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-travel-500 to-sunset-500 rounded-full w-32 h-32 flex items-center justify-center">
              <Compass className="h-16 w-16 text-white animate-spin" style={{ animationDuration: '8s' }} />
            </div>
          </div>
          
          <h1 className="text-6xl font-bold bg-gradient-to-r from-travel-600 to-sunset-600 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Oops! You're off the map
          </h2>
          <p className="text-gray-600 mb-8">
            Looks like this destination doesn't exist in our travel universe. 
            Let's get you back on the right path!
          </p>
        </div>

        {/* Action buttons */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm scale-in">
          <CardContent className="p-6 space-y-4">
            <Link to="/" className="block">
              <Button className="w-full bg-gradient-to-r from-travel-500 to-sunset-500 hover:from-travel-600 hover:to-sunset-600 text-white h-12 text-base font-semibold">
                <Home className="h-5 w-5 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <Link to="/dashboard" className="block">
              <Button variant="outline" className="w-full border-travel-200 text-travel-700 hover:bg-travel-50 h-12">
                <Map className="h-5 w-5 mr-2" />
                My Dashboard
              </Button>
            </Link>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 mb-3">Popular destinations:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link to="/?destination=Paris" className="text-xs px-3 py-1 bg-travel-100 text-travel-700 rounded-full hover:bg-travel-200 transition-colors">
                  Paris
                </Link>
                <Link to="/?destination=Tokyo" className="text-xs px-3 py-1 bg-sunset-100 text-sunset-700 rounded-full hover:bg-sunset-200 transition-colors">
                  Tokyo
                </Link>
                <Link to="/?destination=New York" className="text-xs px-3 py-1 bg-travel-100 text-travel-700 rounded-full hover:bg-travel-200 transition-colors">
                  New York
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-400 mb-2">
            <Globe className="h-4 w-4" />
            <span className="text-sm">TravelGenius</span>
          </div>
          <p className="text-xs text-gray-400">
            Your AI-powered travel companion
          </p>
        </div>
      </div>
    </div>
  );
}
