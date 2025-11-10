<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1oOOIDvn7BRzz9sLCrbR80Iz_SX7P6XJO

## Run Locally

**Prerequisites:**  Node.js (version 18 or higher)


1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the root directory and set your Gemini API key:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```
   You can get your API key from: https://ai.google.dev/

3. Run the development server:
   ```bash
   npm run dev
   ```
   The app will be available at http://localhost:3000

4. Build for production:
   ```bash
   npm run build
   ```
   The built files will be in the `dist` directory.

5. Preview production build:
   ```bash
   npm run preview
   ```
