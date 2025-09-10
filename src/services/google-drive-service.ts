'use client';

// Use Google's official JavaScript library with PKCE (more secure)
class HybridGoogleDriveService {
  private clientId: string;
  private accessToken: string | null = null;

  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('googleDriveAccessToken');
    }
  }

  // Load Google API library
  private async loadGoogleAPI(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Window not available'));
        return;
      }

      // Check if already loaded
      if (window.google && window.google.accounts) {
        resolve(window.google);
        return;
      }

      // Load the Google API script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        // Wait a bit for the API to initialize
        setTimeout(() => {
          if (window.google && window.google.accounts) {
            resolve(window.google);
          } else {
            reject(new Error('Google API failed to load'));
          }
        }, 500);
      };
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  }

  async signInWithGoogleDrive() {
    try {
      console.log('Loading Google API...');
      const google = await this.loadGoogleAPI();
      
      console.log('Initializing OAuth...');
      const client = google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        callback: (response: any) => {
          console.log('OAuth response:', response);
          
          if (response.access_token) {
            this.accessToken = response.access_token;
            localStorage.setItem('googleDriveAccessToken', response.access_token);
            localStorage.removeItem('driveAuthPending');
            
            // Trigger a custom event to notify the component
            window.dispatchEvent(new CustomEvent('googleDriveAuthSuccess', {
              detail: { accessToken: response.access_token }
            }));
            
            console.log('Google Drive authentication successful');
          } else {
            console.error('No access token in response');
            window.dispatchEvent(new CustomEvent('googleDriveAuthError', {
              detail: { error: 'No access token received' }
            }));
          }
        },
        error_callback: (error: any) => {
          console.error('OAuth error:', error);
          localStorage.removeItem('driveAuthPending');
          window.dispatchEvent(new CustomEvent('googleDriveAuthError', {
            detail: { error }
          }));
        }
      });

      localStorage.setItem('driveAuthPending', 'true');
      client.requestAccessToken();
    } catch (error) {
      console.error('Error initializing Google Drive auth:', error);
      localStorage.removeItem('driveAuthPending');
      throw error;
    }
  }

  async handleGoogleDriveRedirectResult(): Promise<string | null> {
    // With the new API, we don't need to handle redirects
    // The callback handles everything
    
    // Just check if we have a stored token
    if (this.accessToken) {
      const isValid = await this.verifyToken(this.accessToken);
      if (isValid) {
        return this.accessToken;
      } else {
        this.clearToken();
      }
    }

    return null;
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`);
      if (response.ok) {
        const tokenInfo = await response.json();
        return tokenInfo.scope?.includes('https://www.googleapis.com/auth/drive.readonly');
      }
      return false;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }

  clearToken() {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('googleDriveAccessToken');
      localStorage.removeItem('driveAuthPending');
    }
  }

  getAccessToken(): string | null {
    return this.accessToken || (typeof window !== 'undefined' ? localStorage.getItem('googleDriveAccessToken') : null);
  }

  async listFiles(companyName: string) {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    try {
      const query = companyName ? `name contains '${companyName.replace(/'/g, "\\'")}'` : '';
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink,iconLink)&pageSize=20`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          throw new Error('Authentication expired. Please sign in again.');
        }
        throw new Error(`Drive API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Drive API response:', data);
      return data.files || [];
    } catch (error) {
      console.error('Error listing Drive files:', error);
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    google: any;
  }
}

const hybridDriveService = new HybridGoogleDriveService();

export const signInWithGoogleDriveRedirect = () => hybridDriveService.signInWithGoogleDrive();
export const handleGoogleDriveRedirectResult = () => hybridDriveService.handleGoogleDriveRedirectResult();
export const listFiles = (companyName: string) => hybridDriveService.listFiles(companyName);
export const isGoogleDriveAuthenticated = () => hybridDriveService.isAuthenticated();
export const clearGoogleDriveAuth = () => hybridDriveService.clearToken();