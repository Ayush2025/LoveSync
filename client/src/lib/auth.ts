import { apiRequest } from "./queryClient";
import type { LoginData, SignupData, User } from "@shared/schema";

interface AuthResponse {
  user: User;
  sessionId: string;
}

export class AuthService {
  private static SESSION_KEY = 'auth_session';

  static getSessionId(): string | null {
    return localStorage.getItem(this.SESSION_KEY);
  }

  static setSessionId(sessionId: string): void {
    localStorage.setItem(this.SESSION_KEY, sessionId);
  }

  static clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  static async login(loginData: LoginData): Promise<AuthResponse> {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
    
    console.log('AuthService - Login successful, storing session:', response.sessionId.substring(0, 8) + '...');
    this.setSessionId(response.sessionId);
    return response;
  }

  static async signup(signupData: SignupData): Promise<AuthResponse> {
    // Remove undefined email field before sending
    const payload = { ...signupData };
    if (payload.email === undefined) {
      delete payload.email;
    }
    
    console.log('AuthService - Signup payload:', { ...payload, password: '***' });
    
    const response = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    this.setSessionId(response.sessionId);
    return response;
  }

  static async logout(): Promise<void> {
    const sessionId = this.getSessionId();
    if (sessionId) {
      try {
        await apiRequest('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionId}`,
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    this.clearSession();
  }

  static async getCurrentUser(): Promise<{ user: User } | null> {
    const sessionId = this.getSessionId();
    if (!sessionId) {
      console.log('AuthService - No session ID found in localStorage');
      return null;
    }

    try {
      console.log('AuthService - Checking current user with session:', sessionId.substring(0, 8) + '...');
      const response = await apiRequest('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${sessionId}`,
        },
      });
      console.log('AuthService - Current user check successful:', response.user.username);
      return response;
    } catch (error: any) {
      console.log('AuthService - Session check failed:', error.message || error);
      console.log('AuthService - Clearing invalid session from localStorage');
      this.clearSession();
      return null;
    }
  }
}