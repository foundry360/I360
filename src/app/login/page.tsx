'use client';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const username = (e.currentTarget.elements.namedItem('username') as HTMLInputElement).value;
    if (!username) {
      alert('Username is required.');
      return;
    }
    
    try {
      const userDocRef = doc(db, 'users', username);
      await setDoc(userDocRef, {
        username: username,
        lastLogin: serverTimestamp(),
      }, { merge: true });
      router.push(`/dashboard/workspaces`);
    } catch (error) {
      console.error("Error saving user data:", error);
      alert('There was an error logging in. Please try again.');
    }
  };

  return (
     <div style={{ fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{width: '100%', maxWidth: '300px'}}>
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <button 
            type="submit" 
            style={{ width: '100%', padding: '10px', border: 'none', borderRadius: '4px', backgroundColor: '#0070f3', color: 'white', cursor: 'pointer' }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
