import fetch from 'node-fetch';
export default async function (req, res) {

  const client_id = 'KDFVIlAhpqPTqfF5GiFcGCqRAAyUrbIz';
  const client_secret = 'nt541EwIsvpjJF1I';  
  const tokenEndpoint = 'https://test.api.amadeus.com/v1/security/oauth2/token';
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  const requestBody = `grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}`;

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers,
      body: requestBody,
    });

    if (!response.ok) {
      throw new Error('Failed to obtain OAuth2 token');
    }

    const data = await response.json();
    const accessToken = data.access_token;

    // Now you can use the accessToken to make authenticated API requests
    //console.log('Access Token:', accessToken);
    return res.json(accessToken);
  } catch (error) {
    //console.error('Error:', error.message);
    return res.json(error);
  }
};