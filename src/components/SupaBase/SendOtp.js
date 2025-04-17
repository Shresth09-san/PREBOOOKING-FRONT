import { supabase } from '../SupaBase/supabaseClient.js';

async function sendEmailOtp(email) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: 'http://localhost:3000/verify', // your app's redirect URL
    },
  });

  if (error) {
    console.error('Error sending email OTP:', error.message);
  } else {
    console.log('OTP sent to email!');
  }
}
