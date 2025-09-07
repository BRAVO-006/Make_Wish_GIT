// The triple-slash directive has been removed as it's no longer needed.
// The new deno.d.ts file will provide the types globally.

// The modern way to start a server in Deno.
Deno.serve(async (req) => {
  // This is a simulated email function.
  // In a real application, you would integrate an email service like Resend, SendGrid, or Postmark.
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    } });
  }

  try {
    const { recipientEmail, recipientName, itemName, wishlistTitle } = await req.json();

    console.log('---- EMAIL SIMULATION ----');
    console.log(`To: ${recipientEmail}`);
    console.log(`From: Make Wish <noreply@yourdomain.com>`);
    console.log(`Subject: Thank you for your gift from "${wishlistTitle}"!`);
    console.log('Body:');
    console.log(`Hi ${recipientName},`);
    console.log(`Thank you so much for fulfilling the wish for "${itemName}"!`);
    console.log('Your thoughtful gift is greatly appreciated.');
    console.log('--------------------------');

    return new Response(
      JSON.stringify({ message: `Simulated email sent successfully to ${recipientEmail}` }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' // Add CORS header for the actual request
        }, 
        status: 200 
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' // Add CORS header for the error response
        }, 
        status: 400 
      },
    )
  }
})

