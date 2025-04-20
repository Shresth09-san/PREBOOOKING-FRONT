// export async function sendEmailOtp(email) {
//   const result = await supabase.auth.signInWithOtp({
//     email,
//     options: {
//       emailRedirectTo: 'http://localhost:8080/verify',
//     },
//   });
  
//   if (result.error) {
//     console.error('Error sending email OTP:', result.error.message);
//   } else {
//     console.log('OTP sent to email!');
//   }
  
//   return result;
// }