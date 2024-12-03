import { GEMINI_CONFIG } from './config.js';

export class GeminiService {
  static async callApi(prompt) {
    try {
      const response = await fetch(`${GEMINI_CONFIG.BASE_URL}?key=${GEMINI_CONFIG.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }
}
