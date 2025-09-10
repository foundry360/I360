
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
      if (typeof window !== 'undefined' && !localStorage.getItem('driveAuthPending')) {
        // If we didn't initiate the auth flow, don't do anything.
        return this.getAccessToken();
      }
      
      const result = await getRedirectResult(auth);
      
      if (result) {
        localStorage.removeItem('driveAuthPending');
        
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const accessToken = credential?.accessToken;
        
        if (accessToken) {
          this.accessToken = accessToken;
          localStorage.setItem('googleDriveAccessToken', accessToken);
          console.log('Google Drive authentication successful');
          return accessToken;
        } else {
          console.error('No access token received');
          return null;
        }
      }
      
      if (this.isAuthenticated()) {
        const isValid = await this.verifyToken(this.getAccessToken()!);
        if (isValid) {
          return this.getAccessToken();
        } else {
          this.clearToken();
          return null;
        }
      }
      
      return null;
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('driveAuthPending');
      }
      console.error('Error handling Google Drive redirect result:', error);
      throw error;
    }
  }

  async verifyToken(token: string) {
    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`);
      return response.ok;
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

  getAccessToken() {
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
      const query = `name contains '${companyName}'`;
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink,iconLink)&pageSize=10`;
      
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
      return data.files || [];
    } catch (error) {
      console.error('Error listing Drive files:', error);
      throw error;
    }
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }
}

const driveService = new GoogleDriveService();

export const signInWithGoogleDriveRedirect = () => driveService.signInWithGoogleDriveRedirect();
export const handleGoogleDriveRedirectResult = () => driveService.handleGoogleDriveRedirectResult();
export const listFiles = (companyName: string) => driveService.listFiles(companyName);
export const isGoogleDriveAuthenticated = () => driveService.isAuthenticated();
export const clearGoogleDriveAuth = () => driveService.clearToken();
