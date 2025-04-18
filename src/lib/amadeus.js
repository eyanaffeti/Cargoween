import axios from "axios";

const AMADEUS_API_KEY = "gP0SxTCAqANReeJZd2OW8NmFXt3Cgyqv"; // remplace avec ta vraie clé
const AMADEUS_API_SECRET = "i7xSNgTVJuwD69QG";

export async function getAccessToken() {
  const url = "https://test.api.amadeus.com/v1/security/oauth2/token";

  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", AMADEUS_API_KEY);
  params.append("client_secret", AMADEUS_API_SECRET);

  try {
    const response = await axios.post(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Erreur lors de l\'obtention du token :', error.response?.data || error.message);
    throw new Error('Échec de l\'obtention du token');
  }
}