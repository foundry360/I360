'use client';

import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, type UserCredential } from 'firebase/auth';

class GoogleDriveService {
  provider: GoogleAuthProvider;
  accessToken: string | null;

  constructor() {
    this.provider = new GoogleAuthProvider();
    this.provider.addScope('https://www.googleapis.com/auth/drive.readonly');
    this.accessToken = null;
    
    if (typeof window !== 'undefined') {
        this.accessToken = localStorage.getItem('googleDriveAccessToken');
    }
  }

  async signInWithGoogleDriveRedirect() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('driveAuthPending', 'true');
      }
      await signInWithRedirect(auth, this.provider);
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('driveAuthPending');
      }
      console.error('Error initiating Google Drive redirect:', error);
      throw error;
    }
  }

  async handleGoogleDriveRedirectResult(): Promise<string | null> {
    try {
      // Always check for redirect result first
      const result = await getRedirectResult(auth);
      
      if (result) {
        // Clear any pending flag since we got a result
        if (typeof window !== 'undefined') {
          localStorage.removeItem('driveAuthPending');
        }
        
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const accessToken = credential?.accessToken;
        
        if (accessToken) {
          this.accessToken = accessToken;
          if (typeof window !== 'undefined') {
            localStorage.setItem('googleDriveAccessToken', accessToken);
          }
          console.log('Google Drive authentication successful');
          return accessToken;
        } else {
          console.error('No access token received from redirect result');
          return null;
        }
      }
      
      // If no redirect result, check if we have a stored token
      if (this.isAuthenticated()) {
        const currentToken = this.getAccessToken();
        if (currentToken) {
          const isValid = await this.verifyToken(currentToken);
          if (isValid) {
            console.log('Using existing valid token');
            return currentToken;
          } else {
            console.log('Stored token is invalid, clearing');
            this.clearToken();
            return null;
          }
        }
      }
      
      // No authentication available
      console.log('No authentication available');
      return null;
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('driveAuthPending');
      }
      console.error('Error handling Google Drive redirect result:', error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`);
      
      if (response.ok) {
        const tokenInfo = await response.json();
        // Check if the token has the required scope
        const hasRequiredScope = tokenInfo.scope?.includes('https://www.googleapis.com/auth/drive.readonly');
        return hasRequiredScope;
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
    if (typeof window !== 'undefined') {
        return this.accessToken || localStorage.getItem('googleDriveAccessToken');
    }
    return null;
  }

  async listFiles(companyName: string) {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    try {
      // More flexible search query
      const query = companyName ? `name contains '${companyName.replace(/'/g, "\\'")}'` : '';
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink,iconLink,mimeType,createdTime)&pageSize=20&orderBy=modifiedTime desc`;
      
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

  // Debug helper method
  getDebugInfo() {
    if (typeof window === 'undefined') return { server: true };
    
    return {
      hasStoredToken: !!localStorage.getItem('googleDriveAccessToken'),
      authPending: !!localStorage.getItem('driveAuthPending'),
      currentToken: this.getAccessToken()?.substring(0, 20) + '...',
      isAuthenticated: this.isAuthenticated()
    };
  }
}

const driveService = new GoogleDriveService();

export const signInWithGoogleDriveRedirect = () => driveService.signInWithGoogleDriveRedirect();
export const handleGoogleDriveRedirectResult = () => driveService.handleGoogleDriveRedirectResult();
export const listFiles = (companyName: string) => driveService.listFiles(companyName);
export const isGoogleDriveAuthenticated = () => driveService.isAuthenticated();
export const clearGoogleDriveAuth = () => driveService.clearToken();
export const getGoogleDriveDebugInfo = () => driveService.getDebugInfo();
