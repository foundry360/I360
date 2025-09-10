'use client';

import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';

class FirebaseGoogleDriveService {
  provider: GoogleAuthProvider;
  accessToken: string | null;

  constructor() {
    this.provider = new GoogleAuthProvider();
    // Add the Drive scope
    this.provider.addScope('https://www.googleapis.com/auth/drive.readonly');
    // Set custom parameters to ensure we get an access token
    this.provider.setCustomParameters({
      'access_type': 'online',
      'prompt': 'consent'
    });
    this.accessToken = null;
    
    if (typeof window !== 'undefined') {
        this.accessToken = localStorage.getItem('googleDriveAccessToken');
    }
  }

  // Try popup first, fallback to redirect
  async signInWithGoogleDrive() {
    try {
      console.log('Attempting popup sign-in...');
      
      // First try popup (works better for getting access tokens)
      const result = await signInWithPopup(auth, this.provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      if (credential?.accessToken) {
        this.accessToken = credential.accessToken;
        localStorage.setItem('googleDriveAccessToken', credential.accessToken);
        console.log('Popup auth successful with access token');
        return credential.accessToken;
      } else {
        console.log('Popup auth succeeded but no access token, trying redirect...');
        throw new Error('No access token from popup');
      }
    } catch (error: any) {
      console.log('Popup failed, trying redirect:', error.code);
      
      // If popup fails, use redirect
      if (error.code === 'auth/popup-blocked' || 
          error.code === 'auth/popup-closed-by-user' ||
          error.code === 'auth/cancelled-popup-request') {
        
        localStorage.setItem('driveAuthPending', 'true');
        await signInWithRedirect(auth, this.provider);
      } else {
        throw error;
      }
    }
  }

  async handleGoogleDriveRedirectResult(): Promise<string | null> {
    try {
      console.log('Checking for redirect result...');
      
      // Check if we're expecting a redirect result
      const authPending = localStorage.getItem('driveAuthPending');
      if (!authPending) {
        // Not expecting a redirect, check stored token
        return this.checkStoredToken();
      }

      const result = await getRedirectResult(auth);
      
      if (result) {
        console.log('Got redirect result');
        localStorage.removeItem('driveAuthPending');
        
        const credential = GoogleAuthProvider.credentialFromResult(result);
        
        if (credential?.accessToken) {
          this.accessToken = credential.accessToken;
          localStorage.setItem('googleDriveAccessToken', credential.accessToken);
          console.log('Redirect auth successful with access token');
          return credential.accessToken;
        } else {
          console.log('Redirect result has no access token');
          
          // If no access token from redirect, try to get one via popup
          // This sometimes happens with Firebase Auth
          try {
            console.log('Attempting to get access token via popup...');
            const popupResult = await signInWithPopup(auth, this.provider);
            const popupCredential = GoogleAuthProvider.credentialFromResult(popupResult);
            
            if (popupCredential?.accessToken) {
              this.accessToken = popupCredential.accessToken;
              localStorage.setItem('googleDriveAccessToken', popupCredential.accessToken);
              console.log('Got access token via popup after redirect');
              return popupCredential.accessToken;
            }
          } catch (popupError) {
            console.error('Popup after redirect failed:', popupError);
          }
        }
      } else {
        console.log('No redirect result found');
        localStorage.removeItem('driveAuthPending');
      }

      // Check for stored token
      return this.checkStoredToken();
    } catch (error) {
      console.error('Error handling redirect result:', error);
      localStorage.removeItem('driveAuthPending');
      return this.checkStoredToken();
    }
  }

  private async checkStoredToken(): Promise<string | null> {
    if (this.accessToken) {
      const isValid = await this.verifyToken(this.accessToken);
      if (isValid) {
        console.log('Using existing valid token');
        return this.accessToken;
      } else {
        console.log('Stored token is invalid');
        this.clearToken();
      }
    }
    
    console.log('No valid authentication available');
    return null;
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`);
      if (response.ok) {
        const tokenInfo = await response.json();
        const hasRequiredScope = tokenInfo.scope?.includes('https://www.googleapis.com/auth/drive.readonly');
        console.log('Token verification:', { 
          valid: true, 
          hasScope: hasRequiredScope,
          scopes: tokenInfo.scope 
        });
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
      const query = companyName ? `name contains '${companyName.replace(/'/g, "\\'")}'` : '';
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink,iconLink,mimeType)&pageSize=20&orderBy=modifiedTime desc`;
      
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

const firebaseDriveService = new FirebaseGoogleDriveService();

export const signInWithGoogleDrive = () => firebaseDriveService.signInWithGoogleDrive();
export const handleGoogleDriveRedirectResult = () => firebaseDriveService.handleGoogleDriveRedirectResult();
export const listFiles = (companyName: string) => firebaseDriveService.listFiles(companyName);
export const isGoogleDriveAuthenticated = () => firebaseDriveService.isAuthenticated();
export const clearGoogleDriveAuth = () => firebaseDriveService.clearToken();
