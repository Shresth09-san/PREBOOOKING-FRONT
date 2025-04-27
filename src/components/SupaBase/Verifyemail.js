import { useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function VerifyPage() {
  useEffect(() => {
    const verifyUser = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (data?.session) {
       
      } else if (error) {
        
      }
    };

    verifyUser();
  }, []);

  return <div>Verifying... Please wait.</div>;
}
