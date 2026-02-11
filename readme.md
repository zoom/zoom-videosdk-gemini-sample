# Video SDK Web - RTMS - Sentiment Analysis

Use of this sample app is subject to our [Terms of Use](https://explore.zoom.us/en/video-sdk-terms/).

The [Zoom Video SDK for Web](https://developers.zoom.us/docs/video-sdk/web/) enables you to build custom video experiences on a webpage with Zoom's core technology. 

This demo showcases using the Zoom Video SDK alongside the Google Gemini Live API agent in a frictionless experience. 

## Installation

To get started, clone the repo:

`git clone https://github.com/zoom/zoom-videosdk-gemini-sample.git`

## Setup

1. Install the dependencies:

   `bun install # or npm install`

2. Create a `.env` file in the root directory of the project, you can do this by copying the `.env.example` file (`cp .env.example .env`) and replacing the values with your own. The `.env` file should look like this, with your own Zoom Video SDK Credentials:

   ```
   ZOOM_SDK_KEY=
   OOM_SDK_SECRET=
   GEMINI_API_KEY=
   ```

3. Use this command to generate your JWT Token on the console
   
   `node generateToken.js [sessionname]`

4. Run the app:
   `npm run start` or `bun start`
   
## Usage

1. Navigate to http://localhost:3004 or which ever port was chosen when starting the application

2. Click "Join Session" to join the session

3. You can now test Gemini while in the Zoom Session

For the full list of features and event listeners, as well as additional guides, see our [Video SDK docs](https://developers.zoom.us/docs/video-sdk/web/).

## Need help?

If you're looking for help, try [Developer Support](https://devsupport.zoom.us) or our [Developer Forum](https://devforum.zoom.us). Priority support is also available with [Premier Developer Support](https://explore.zoom.us/docs/en-us/developer-support-plans.html) plans.

## Disclaimer

Do not expose your credentials to the client, when using the Video SDK in production please make sure to use a backend service to sign the tokens. Don't store credentials in plain text, as this is a sample app we're using an `.env` for sake of simplicity.
