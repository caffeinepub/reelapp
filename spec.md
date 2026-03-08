# ReelApp

## Current State
- Full-screen TikTok-style video app with dark electric-pink theme
- Four tabs: Home (video feed), Explore (grid), Upload, Profile
- No splash/intro screen -- app opens directly to the video feed

## Requested Changes (Diff)

### Add
- SplashPage component showing the "Reel Star" branding splash screen
  - Deep purple/indigo radial gradient background (matching uploaded image)
  - Gold star shape behind the logo
  - "Reel" text in cursive purple/lavender style
  - "STAR" text in bold gold metallic style
  - "PLAY NOW" orange CTA button
  - Twinkling dot-light background effect
- App.tsx updated to show SplashPage on first load; clicking "PLAY NOW" transitions to the main app

### Modify
- App.tsx: add `showSplash` state, render SplashPage when true, main app when false

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/pages/SplashPage.tsx` with Reel Star design using the uploaded image as reference
2. Update `App.tsx` to conditionally render SplashPage before the main tab UI
