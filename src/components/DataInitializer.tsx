import { useEffect, useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function DataInitializer() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      // Only run once
      if (initialized) return;

      try {
        console.log('[DATA INIT] Starting data initialization...');
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/admin/init-data`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log('[DATA INIT] Success:', result);
          console.log('[DATA INIT] Updated:', {
            products: result.updated?.products,
            counselors: result.updated?.counselors,
            resources: result.updated?.resources
          });
          console.log('[DATA INIT] Counts:', {
            products: result.counts?.products,
            counselors: result.counts?.counselors,
            resources: result.counts?.resources
          });
          setInitialized(true);
        } else {
          const error = await response.text();
          console.error('[DATA INIT] Failed to initialize data:', error);
        }
      } catch (error) {
        console.error('[DATA INIT] Error initializing data:', error);
      }
    };

    // Run initialization after a short delay to ensure backend is ready
    const timer = setTimeout(() => {
      initializeData();
    }, 1000);

    return () => clearTimeout(timer);
  }, []); // Run only once on mount

  return null; // This component doesn't render anything
}