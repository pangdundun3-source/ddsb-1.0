<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/022eb7df-cf7c-4a8a-a8b8-e6ec5f17b5fb

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the suite (portal + 4 terminals):
   `npm run dev`

Fixed local ports:
- 门户: `http://localhost:3000/`
- V8客户管理端: `http://localhost:3001/`
- V8审核上报H5: `http://localhost:3003/`
- V8审核上报PC: `http://localhost:3002/`
- MT应用管理端: `http://localhost:3004/`

Portal only: `npm run dev:portal`  
Same as `npm run dev`: `npm run dev:all`
