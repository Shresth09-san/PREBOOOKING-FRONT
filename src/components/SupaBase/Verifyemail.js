import { useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function VerifyPage() {
  useEffect(() => {
    const verifyUser = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (data?.session) {
        console.log('User logged in via OTP!', data.session.user);
      } else if (error) {
        console.error('Error:', error.message);
      }
    };

    verifyUser();
  }, []);

  return <div>Verifying... Please wait.</div>;
}
