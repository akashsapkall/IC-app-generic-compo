'use client';

import { useEffect } from 'react';

export default function LogoutListener() {
  useEffect(() => {
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === 'logout_event') {
        window.location.replace(window.location.origin);
      }
    };
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; 
      const now = Date.now();
      const delay = expiryTime - now;

      if (delay <= 0) {
        triggerLogout();
        return;
      }

      const timeout = setTimeout(() => {
        triggerLogout();
      }, delay);

      return () => clearTimeout(timeout);
    } catch (err) {
      console.error('Failed to parse token', err);
      triggerLogout(); 
    }
  }, []);

  const triggerLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('org_id');
    localStorage.setItem('logout_event', Date.now().toString());
    window.location.replace(window.location.origin);
  };

  return null;
}
