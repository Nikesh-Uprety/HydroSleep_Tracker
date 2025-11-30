import AsyncStorage from '@react-native-async-storage/async-storage';

const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const hostname = window.location.hostname;
    if (hostname.includes('replit.dev') || hostname.includes('replit.app')) {
      return `https://${hostname}/api`;
    }
  }
  return 'http://localhost:5001/api';
};

const API_BASE_URL = getApiBaseUrl();

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private token: string | null = null;

  async setToken(token: string | null) {
    this.token = token;
    if (token) {
      await AsyncStorage.setItem('authToken', token);
    } else {
      await AsyncStorage.removeItem('authToken');
    }
  }

  async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem('authToken');
    }
    return this.token;
  }

  async clearToken() {
    this.token = null;
    await AsyncStorage.removeItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Request failed' };
      }

      return { data };
    } catch (error) {
      console.error('API request error:', error);
      return { error: 'Network error. Please try again.' };
    }
  }

  async register(name: string, email: string, password: string) {
    const result = await this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    if (result.data?.token) {
      await this.setToken(result.data.token);
    }

    return result;
  }

  async login(email: string, password: string) {
    const result = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (result.data?.token) {
      await this.setToken(result.data.token);
    }

    return result;
  }

  async logout() {
    await this.clearToken();
  }

  async getUser() {
    return this.request<any>('/user/me');
  }

  async updateProfile(displayName: string, email: string) {
    return this.request<any>('/user/me', {
      method: 'PUT',
      body: JSON.stringify({ displayName, email }),
    });
  }

  async updatePassword(currentPassword: string, newPassword: string) {
    return this.request<{ message: string }>('/user/me/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async updateAvatar(profileImageUrl: string) {
    return this.request<any>('/user/me/avatar', {
      method: 'PUT',
      body: JSON.stringify({ profileImageUrl }),
    });
  }

  async getGoals() {
    return this.request<any[]>('/goals');
  }

  async createGoal(label: string, value: number, unit: string) {
    return this.request<any>('/goals', {
      method: 'POST',
      body: JSON.stringify({ label, value, unit }),
    });
  }

  async updateGoal(id: string, value: number) {
    return this.request<any>(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  async deleteGoal(id: string) {
    return this.request<{ message: string }>(`/goals/${id}`, {
      method: 'DELETE',
    });
  }

  async getLatestSleep() {
    return this.request<{ entry: any; suggestion: string }>('/sleep/latest');
  }

  async getWeeklySleep(start?: string) {
    const query = start ? `?start=${start}` : '';
    return this.request<{ startDate: string; entries: any[] }>(`/sleep/week${query}`);
  }

  async addSleep(data: {
    date: string;
    durationMinutes: number;
    restedPercent: number;
    remPercent: number;
    deepSleepPercent: number;
    notes?: string;
  }) {
    return this.request<any>('/sleep', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTodayWater() {
    return this.request<{ date: string; amountMl: number; dailyGoalMl: number; progress: number }>(
      '/water/today'
    );
  }

  async getWeeklyWater(start?: string) {
    const query = start ? `?start=${start}` : '';
    return this.request<{
      startDate: string;
      dailyGoalMl: number;
      dailyGoalLiters: number;
      weeklyGoalMet: boolean;
      goalMetCount: number;
      entries: any[];
    }>(`/water/week${query}`);
  }

  async addWater(amountMl: number, date?: string) {
    return this.request<any>('/water', {
      method: 'POST',
      body: JSON.stringify({ amountMl, date }),
    });
  }

  async getDashboardSummary() {
    return this.request<{
      user: any;
      water: any;
      sleep: any;
      goals: any[];
    }>('/dashboard/summary');
  }

  async getAnalyticsSummary(range?: string) {
    const query = range ? `?range=${range}` : '';
    return this.request<{
      sleep: { days: string[]; hours: number[]; average: number; goalHours: number; goalMetCount: number };
      water: { days: string[]; liters: number[]; dailyGoalLiters: number; goalMetCount: number };
      goals: { totalGoals: number; completedToday: number; weeklyCompletionRatePercent: number };
    }>(`/analytics/summary${query}`);
  }

  async checkHealth() {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

export const api = new ApiClient();
export default api;
