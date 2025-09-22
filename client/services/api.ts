// API service layer for communicating with backend

const API_BASE_URL = '/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  user?: any;
  sessionId?: string;
  trip?: any;
  trips?: any[];
  itinerary?: any[];
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private sessionId: string | null = null;

  constructor() {
    this.sessionId = localStorage.getItem('travelgenius_session_id');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    };

    if (this.sessionId) {
      headers.Authorization = `Bearer ${this.sessionId}`;
    }

    console.log(`API Request: ${options.method || 'GET'} ${url}`, {
      headers: { ...headers, Authorization: headers.Authorization ? 'Bearer [REDACTED]' : undefined },
      body: options.body
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      console.log(`API Response: ${response.status} ${response.statusText}`, {
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorData: any = {};

        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } else {
            const textResponse = await response.text();
            console.error('Non-JSON error response:', textResponse);
            errorMessage = textResponse || errorMessage;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorMessage = `${errorMessage} (Unable to parse error details)`;
        }

        console.error('API Error:', errorMessage, errorData);
        throw new ApiError(response.status, errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      } else {
        return response.text() as any;
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error('Network or other error:', error);
      throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown network error'}`);
    }
  }

  // Authentication methods
  async signup(name: string, email: string, password: string) {
    const response = await this.request<ApiResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });

    if (response.sessionId) {
      this.sessionId = response.sessionId;
      localStorage.setItem('travelgenius_session_id', response.sessionId);
    }

    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<ApiResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (response.sessionId) {
      this.sessionId = response.sessionId;
      localStorage.setItem('travelgenius_session_id', response.sessionId);
    }

    return response;
  }

  async logout() {
    const response = await this.request<ApiResponse>('/auth/logout', {
      method: 'POST'
    });

    this.sessionId = null;
    localStorage.removeItem('travelgenius_session_id');
    localStorage.removeItem('travelgenius_user');

    return response;
  }

  async getCurrentUser() {
    if (!this.sessionId) {
      throw new ApiError(401, 'No session available');
    }

    return this.request<ApiResponse>('/auth/me');
  }

  // Trip management methods
  async generateTrip(tripData: {
    destination: string;
    startDate: string;
    endDate: string;
    budget?: number;
    travelers: number;
    interests: string[];
  }) {
    return this.request<ApiResponse>('/trips/generate', {
      method: 'POST',
      body: JSON.stringify(tripData)
    });
  }

  async getTrips() {
    return this.request<ApiResponse>('/trips');
  }

  async getTrip(id: string) {
    return this.request<ApiResponse>(`/trips/${id}`);
  }

  async updateTrip(id: string, updates: any) {
    return this.request<ApiResponse>(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteTrip(id: string) {
    return this.request<ApiResponse>(`/trips/${id}`, {
      method: 'DELETE'
    });
  }

  // Health check
  async ping() {
    return this.request<ApiResponse>('/ping');
  }

  // Session management
  setSessionId(sessionId: string) {
    this.sessionId = sessionId;
    localStorage.setItem('travelgenius_session_id', sessionId);
  }

  clearSession() {
    this.sessionId = null;
    localStorage.removeItem('travelgenius_session_id');
    localStorage.removeItem('travelgenius_user');
  }

  hasSession(): boolean {
    return !!this.sessionId;
  }
}

// Export singleton instance
export const apiService = new ApiService();
export { ApiError };
export type { ApiResponse };
