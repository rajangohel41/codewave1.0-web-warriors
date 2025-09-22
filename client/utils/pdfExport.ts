// PDF Export utility for trip itineraries
// Using jsPDF for client-side PDF generation

interface TripData {
  destination: string;
  startDate: string;
  endDate: string;
  duration: number;
  cost: number;
  travelers: number;
  interests: string[];
  itinerary: DayPlan[];
}

interface DayPlan {
  day: number;
  date: string;
  theme: string;
  activities: Activity[];
  totalCost: string;
}

interface Activity {
  time: string;
  title: string;
  description: string;
  duration: string;
  cost: string;
  type: string;
  rating?: number;
}

export const generateTripPDF = (tripData: TripData): void => {
  // Create a simple HTML-based PDF export using the browser's print functionality
  // In a production app, you'd use libraries like jsPDF or html2pdf
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Trip Itinerary - ${tripData.destination}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #0ea5e9;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #0ea5e9;
          margin: 0;
          font-size: 2.5em;
        }
        .header p {
          color: #666;
          margin: 10px 0 0 0;
          font-size: 1.2em;
        }
        .trip-info {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        .info-item {
          text-align: center;
        }
        .info-label {
          font-weight: 600;
          color: #374151;
          display: block;
          margin-bottom: 5px;
        }
        .info-value {
          font-size: 1.1em;
          color: #0ea5e9;
          font-weight: 700;
        }
        .day-section {
          margin-bottom: 40px;
          page-break-inside: avoid;
        }
        .day-header {
          background: linear-gradient(135deg, #0ea5e9, #f97316);
          color: white;
          padding: 15px 20px;
          border-radius: 8px 8px 0 0;
          margin-bottom: 0;
        }
        .day-title {
          font-size: 1.5em;
          margin: 0;
        }
        .day-theme {
          margin: 5px 0 0 0;
          opacity: 0.9;
        }
        .activities {
          border: 1px solid #e5e7eb;
          border-top: none;
          border-radius: 0 0 8px 8px;
        }
        .activity {
          padding: 20px;
          border-bottom: 1px solid #f3f4f6;
          display: grid;
          grid-template-columns: 100px 1fr auto;
          gap: 20px;
          align-items: start;
        }
        .activity:last-child {
          border-bottom: none;
        }
        .activity-time {
          font-weight: 600;
          color: #0ea5e9;
          text-align: center;
          padding: 8px;
          background: #eff6ff;
          border-radius: 6px;
        }
        .activity-content h4 {
          margin: 0 0 8px 0;
          font-size: 1.1em;
          color: #111827;
        }
        .activity-meta {
          display: flex;
          gap: 15px;
          margin: 8px 0;
          font-size: 0.9em;
          color: #6b7280;
        }
        .activity-description {
          color: #4b5563;
          margin: 10px 0 0 0;
        }
        .activity-cost {
          font-weight: 600;
          color: #059669;
          text-align: center;
          padding: 8px;
          background: #ecfdf5;
          border-radius: 6px;
          min-width: 60px;
        }
        .interests {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 20px 0;
        }
        .interest-tag {
          background: #eff6ff;
          color: #1d4ed8;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.9em;
          font-weight: 500;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
        }
        @media print {
          body { margin: 0; }
          .header { page-break-after: avoid; }
          .day-section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${tripData.destination}</h1>
        <p>Your Personalized Travel Itinerary</p>
      </div>

      <div class="trip-info">
        <div class="info-item">
          <span class="info-label">Duration</span>
          <span class="info-value">${tripData.duration} days</span>
        </div>
        <div class="info-item">
          <span class="info-label">Dates</span>
          <span class="info-value">${new Date(tripData.startDate).toLocaleDateString()} - ${new Date(tripData.endDate).toLocaleDateString()}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Travelers</span>
          <span class="info-value">${tripData.travelers} people</span>
        </div>
        <div class="info-item">
          <span class="info-label">Total Cost</span>
          <span class="info-value">$${tripData.cost.toLocaleString()}</span>
        </div>
      </div>

      ${tripData.interests.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h3 style="color: #374151; margin-bottom: 10px;">Your Interests</h3>
          <div class="interests">
            ${tripData.interests.map(interest => `<span class="interest-tag">${interest}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      ${tripData.itinerary.map(day => `
        <div class="day-section">
          <div class="day-header">
            <h2 class="day-title">Day ${day.day} - ${new Date(day.date).toLocaleDateString()}</h2>
            <p class="day-theme">${day.theme}</p>
          </div>
          <div class="activities">
            ${day.activities.map(activity => `
              <div class="activity">
                <div class="activity-time">${activity.time}</div>
                <div class="activity-content">
                  <h4>${activity.title}</h4>
                  <div class="activity-meta">
                    <span>⏱️ ${activity.duration}</span>
                    <span>📍 ${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</span>
                    ${activity.rating ? `<span>⭐ ${activity.rating}</span>` : ''}
                  </div>
                  <p class="activity-description">${activity.description}</p>
                </div>
                <div class="activity-cost">${activity.cost}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}

      <div class="footer">
        <p>Generated by TravelGenius • Your AI-Powered Travel Assistant</p>
        <p>Created on ${new Date().toLocaleDateString()}</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

export const shareItinerary = (tripData: TripData): void => {
  if (navigator.share) {
    navigator.share({
      title: `${tripData.destination} Trip Itinerary`,
      text: `Check out my ${tripData.duration}-day trip to ${tripData.destination}!`,
      url: window.location.href
    }).catch(console.error);
  } else {
    // Fallback: copy to clipboard
    const shareText = `🌍 My ${tripData.duration}-day trip to ${tripData.destination}!\n\n📅 ${new Date(tripData.startDate).toLocaleDateString()} - ${new Date(tripData.endDate).toLocaleDateString()}\n💰 $${tripData.cost.toLocaleString()} total\n\nPlanned with TravelGenius ✈️`;
    
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Trip details copied to clipboard!');
    }).catch(() => {
      alert('Unable to share. Please copy the URL manually.');
    });
  }
};
