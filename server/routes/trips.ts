import { RequestHandler } from "express";
import { tripDB, DayPlan, Activity } from "../database";

// AI Trip Generation Mock Function
const generateItinerary = async (destination: string, startDate: string, endDate: string, interests: string[], budget?: number): Promise<DayPlan[]> => {
  // Calculate trip duration
  const start = new Date(startDate);
  const end = new Date(endDate);
  const tripDuration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

  // Activity templates for different days
  const activityTemplates = [
    {
      theme: "Historic Heart & Cultural Immersion",
      activities: [
        { time: "9:00 AM", title: "Historic Cathedral District", description: "Start your adventure at iconic religious and historic sites. Explore stunning architecture and learn about local history.", duration: "2 hours", cost: "$15", type: "attraction", rating: 4.8 },
        { time: "11:30 AM", title: "River Walk", description: "Stroll along historic riverbanks, enjoying street performers and local vendors.", duration: "1 hour", cost: "Free", type: "activity", rating: 4.5 },
        { time: "12:30 PM", title: "Local Eatery", description: "Experience authentic local cuisine at this popular neighborhood spot.", duration: "1 hour", cost: "$12", type: "restaurant", rating: 4.6 },
        { time: "2:00 PM", title: "Main Museum", description: "Dive into world-class art and culture. Book timed entry in advance for popular exhibits.", duration: "3 hours", cost: "$18", type: "attraction", rating: 4.7 },
        { time: "6:00 PM", title: "Sunset Viewpoint", description: "Golden hour photography at scenic viewpoints. Perfect for memorable photos!", duration: "1 hour", cost: "Free", type: "activity", rating: 4.9 }
      ]
    },
    {
      theme: "Arts & Culture Discovery",
      activities: [
        { time: "9:00 AM", title: "Art District", description: "Explore the artistic heart of the city with galleries and creative spaces.", duration: "2 hours", cost: "$8", type: "attraction", rating: 4.6 },
        { time: "11:30 AM", title: "Artist Quarter", description: "Watch local artists at work and browse unique artwork and crafts.", duration: "1.5 hours", cost: "$25", type: "activity", rating: 4.4 },
        { time: "1:00 PM", title: "Cultural Bistro", description: "Hidden gem restaurant loved by locals. Try regional specialties in an authentic setting.", duration: "1.5 hours", cost: "$35", type: "restaurant", rating: 4.7 },
        { time: "3:00 PM", title: "Creative District", description: "Explore unique shops and soak in the bohemian atmosphere of the creative quarter.", duration: "2 hours", cost: "$10", type: "activity", rating: 4.3 },
        { time: "6:00 PM", title: "Evening Landmark", description: "Visit iconic landmarks as they light up for the evening. Spectacular views guaranteed!", duration: "2 hours", cost: "$30", type: "attraction", rating: 4.8 }
      ]
    },
    {
      theme: "Nature & Adventure",
      activities: [
        { time: "8:00 AM", title: "City Park", description: "Start early at the main city park. Great for morning walks and fresh air.", duration: "2 hours", cost: "Free", type: "activity", rating: 4.5 },
        { time: "10:30 AM", title: "Outdoor Market", description: "Browse local produce and artisan goods at the vibrant morning market.", duration: "1.5 hours", cost: "$20", type: "activity", rating: 4.3 },
        { time: "12:00 PM", title: "Garden Café", description: "Lunch at a charming café with outdoor seating and local specialties.", duration: "1 hour", cost: "$22", type: "restaurant", rating: 4.4 },
        { time: "2:00 PM", title: "Nature Reserve", description: "Explore natural areas and hiking trails just outside the city center.", duration: "3 hours", cost: "$12", type: "activity", rating: 4.6 },
        { time: "6:30 PM", title: "Waterfront Dining", description: "End the day with dinner overlooking water views and beautiful scenery.", duration: "2 hours", cost: "$45", type: "restaurant", rating: 4.7 }
      ]
    },
    {
      theme: "Local Life & Hidden Gems",
      activities: [
        { time: "9:30 AM", title: "Neighborhood Walk", description: "Explore authentic local neighborhoods away from tourist crowds.", duration: "2 hours", cost: "Free", type: "activity", rating: 4.4 },
        { time: "11:30 AM", title: "Local Workshop", description: "Participate in a traditional craft or cooking workshop with locals.", duration: "2 hours", cost: "$40", type: "activity", rating: 4.8 },
        { time: "2:00 PM", title: "Family Restaurant", description: "Lunch at a family-run restaurant serving traditional recipes passed down generations.", duration: "1.5 hours", cost: "$28", type: "restaurant", rating: 4.6 },
        { time: "4:00 PM", title: "Community Center", description: "Visit local community spaces and learn about daily life and culture.", duration: "1.5 hours", cost: "$5", type: "activity", rating: 4.2 },
        { time: "7:00 PM", title: "Night Market", description: "Experience the vibrant evening atmosphere at local night markets.", duration: "2 hours", cost: "$25", type: "activity", rating: 4.5 }
      ]
    },
    {
      theme: "Shopping & Entertainment",
      activities: [
        { time: "10:00 AM", title: "Main Shopping District", description: "Browse the primary shopping areas with both local and international brands.", duration: "2.5 hours", cost: "$50", type: "activity", rating: 4.3 },
        { time: "12:30 PM", title: "Food Court Favorites", description: "Sample diverse local foods at the popular food court or market hall.", duration: "1 hour", cost: "$18", type: "restaurant", rating: 4.4 },
        { time: "2:30 PM", title: "Entertainment Complex", description: "Visit entertainment venues, arcades, or cultural centers for afternoon fun.", duration: "2 hours", cost: "$35", type: "activity", rating: 4.5 },
        { time: "5:00 PM", title: "Rooftop Bar", description: "Enjoy sunset drinks with panoramic city views from a popular rooftop venue.", duration: "2 hours", cost: "$40", type: "restaurant", rating: 4.6 },
        { time: "8:00 PM", title: "Evening Show", description: "Experience local entertainment, live music, or cultural performances.", duration: "2 hours", cost: "$55", type: "activity", rating: 4.7 }
      ]
    }
  ];

  // Generate itinerary for each day
  const itinerary: DayPlan[] = [];
  for (let i = 0; i < tripDuration; i++) {
    const currentDate = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const template = activityTemplates[i % activityTemplates.length];
    
    // Calculate total cost for the day
    const totalCost = template.activities.reduce((sum, activity) => {
      const cost = activity.cost === "Free" ? 0 : parseInt(activity.cost.replace('$', ''));
      return sum + cost;
    }, 0);

    itinerary.push({
      day: i + 1,
      date: currentDate.toISOString().split('T')[0],
      theme: template.theme,
      activities: template.activities as Activity[],
      totalCost: `$${totalCost}`
    });
  }

  return itinerary;
};

// POST /api/trips/generate
export const handleGenerateTrip: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { destination, startDate, endDate, budget, travelers, interests } = req.body;

    // Validation
    if (!destination || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Destination, start date, and end date are required'
      });
    }

    // Generate itinerary
    const itinerary = await generateItinerary(destination, startDate, endDate, interests || [], budget);
    
    // Calculate trip details
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
    const totalCost = itinerary.reduce((sum, day) => sum + parseInt(day.totalCost.replace('$', '')), 0);

    // Create trip record
    const trip = tripDB.create({
      userId: user.id,
      destination,
      startDate,
      endDate,
      duration,
      cost: totalCost,
      travelers: parseInt(travelers) || 1,
      budget: budget ? parseInt(budget) : undefined,
      interests: interests || [],
      status: 'planned',
      thumbnail: `https://images.unsplash.com/search/photos?query=${encodeURIComponent(destination)}&w=400&h=250&fit=crop`,
      itinerary
    });

    res.json({
      success: true,
      trip,
      itinerary
    });
  } catch (error) {
    console.error('Generate trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate trip'
    });
  }
};

// GET /api/trips
export const handleGetTrips: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const trips = tripDB.findByUserId(user.id);

    res.json({
      success: true,
      trips
    });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trips'
    });
  }
};

// GET /api/trips/:id
export const handleGetTrip: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const trip = tripDB.findById(id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if trip belongs to user
    if (trip.userId !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      trip
    });
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trip'
    });
  }
};

// PUT /api/trips/:id
export const handleUpdateTrip: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const updates = req.body;

    const trip = tripDB.findById(id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if trip belongs to user
    if (trip.userId !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedTrip = tripDB.update(id, updates);
    
    res.json({
      success: true,
      trip: updatedTrip
    });
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update trip'
    });
  }
};

// DELETE /api/trips/:id
export const handleDeleteTrip: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const trip = tripDB.findById(id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if trip belongs to user
    if (trip.userId !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    tripDB.delete(id);
    
    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete trip'
    });
  }
};
