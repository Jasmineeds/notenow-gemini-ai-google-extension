# NoteNow - Gemini AI Google Extension

Enhance learning with NoteNow: capture, summarize, and transform recordings into summaries, quizzes, and translations—empowering smarter, multilingual, interactive learning every session.  
This is a Hackathon submission for the Google Chrome Built-in AI Challenge.

## Features

NoteNow is a Chrome extension that enables users to:

- **Real-Time Speech to Text:** Record audio in real-time, segmenting it into manageable parts (Laps).
- **Summary:** Summarize key takeaways for each segment, highlighting essential points.
- **Translation:** Translate audio content into multiple languages to aid multilingual learners.
- **Quiz Generation:** Generate quizzes from recorded content to reinforce understanding and retention.

## Getting Started

To install and set up the extension for development:

- **Download the Extension:**  
  Download the extension files and unzip them into a local folder.

- **Configure Your API Key:**  
  Get a Gemini API Key from [Google AI for Developers](https://ai.google.dev/). This Google Extension uses Gemini 1.5 Flash-8B by default.  
  Navigate to the `extension/src/api/` folder and open `config.js`. Replace `'YOUR_API_KEY'` with your actual API key.

     ```js
   export const config = {
     API_KEY: 'YOUR_API_KEY',  // Replace with your API key
   };
   ```

- **Enable Developer Mode in Chrome:**  
  Install [Chrome Dev channel](https://www.google.com/chrome/dev/) and go to `chrome://extensions/`. Turn on **Developer Mode**.

- **Load the Extension:**  
  Click **Load unpacked** on the Extensions page and select the folder with the unzipped extension files.

- **Enable Microphone Access:**  
  The extension requires access to your microphone for audio recording. Grant microphone permissions:
  1. Go to the right of the address bar in the NoteNow extension settings and click "More".
  2. Select Site settings.
  3. Enable microphone permission by switching it to Allow.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Credits

- **Product Manager:** Annie Yang  
- **Product Designer:** Ling  
- **Developer:** Jasmine Huang
