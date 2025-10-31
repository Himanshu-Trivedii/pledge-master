# PWA Setup Documentation

## Overview

Your Gode Jewellers application has been configured as a Progressive Web App (PWA) with offline support and installable capabilities.

## Files Created/Modified

### 1. **public/manifest.json**
- Defines app metadata, theme colors, display mode, and icon references
- Uses gold theme color (#F5A623) matching your brand
- Configured for standalone display mode

### 2. **public/service-worker.js**
- Implements offline caching strategy
- Cache-first approach for static assets (HTML, CSS, JS, icons)
- Network-first approach for API calls
- Automatic cache cleanup on updates

### 3. **index.html**
- Added PWA meta tags (theme-color, mobile-web-app-capable, etc.)
- Linked manifest.json
- Registered service worker with update notifications

### 4. **vite.config.ts**
- Updated build configuration for proper PWA support
- Ensures service worker is copied to dist folder

### 5. **public/icons/** (Directory)
- Created directory for PWA icons
- Ready for icon files (see setup instructions below)

## Icon Setup

### Required Icon Files

Add these files to `public/icons/`:
- `icon-192x192.png` (192x192 pixels)
- `icon-512x512.png` (512x512 pixels)

### Quick Icon Generation

You can convert your existing logo to create icons using:

1. **PWA Builder** (Recommended):
   - Visit https://www.pwabuilder.com/imageGenerator
   - Upload `public/logos/Gode_Jwellers_Logo.jpg`
   - Download generated icons

2. **Online Tools**:
   - Any image resizer/editor
   - Create square PNG files with the logo centered

3. **ImageMagick** (if installed):
   ```bash
   cd public/icons
   magick convert ../logos/Gode_Jwellers_Logo.jpg -resize 192x192 -background white -gravity center -extent 192x192 icon-192x192.png
   magick convert ../logos/Gode_Jwellers_Logo.jpg -resize 512x512 -background white -gravity center -extent 512x512 icon-512x512.png
   ```

## Testing the PWA

### 1. Development Mode

```bash
npm run dev
```

Open your browser's DevTools:
- **Application** tab → **Service Workers** - should show "activated and running"
- **Application** tab → **Manifest** - verify manifest details
- **Application** tab → **Storage** - check cache usage

### 2. Test Offline Mode

1. Open the app in Chrome DevTools
2. Go to **Network** tab
3. Check "Offline" checkbox
4. Refresh the page - app should load from cache
5. Navigation should work offline

### 3. Production Build

```bash
npm run build
npm run preview
```

Test the production build with the same steps above.

### 4. HTTPS Requirement

PWAs require HTTPS in production. For local testing:
- Development (localhost): Works without HTTPS
- Production: Deploy to HTTPS server

Common hosting solutions:
- Netlify (automatic HTTPS)
- Vercel (automatic HTTPS)
- AWS Amplify
- Firebase Hosting

### 5. Install Prompt

To trigger the "Add to Home Screen" prompt:

**Mobile (Chrome/Edge)**:
1. Visit the site over HTTPS
2. Use the site for a few minutes
3. Tap menu → "Add to Home Screen" or "Install App"

**Desktop (Chrome/Edge)**:
1. Visit the site
2. Look for install icon in address bar
3. Click install when prompted

## Browser Support

- ✅ Chrome/Edge (desktop & mobile)
- ✅ Firefox (desktop & mobile)
- ✅ Safari (iOS 11.3+)
- ⚠️ Safari (macOS) - limited support

## Configuration Details

### Theme Colors
- Primary: `#F5A623` (Gold - matches your brand)
- Background: `#FFFFFF` (White)

### Display Mode
- `standalone` - app opens in its own window, without browser UI

### Caching Strategy
- **Static Assets**: Cache-first (HTML, CSS, JS, images)
- **API Calls**: Network-first (always try fresh data)

### Cache Versions
- Cache version changes in service worker will trigger updates
- Old caches are automatically cleaned up
- Users are prompted to reload when updates are available

## Troubleshooting

### Service Worker Not Registering
- Ensure HTTPS in production
- Check browser console for errors
- Verify service-worker.js is accessible at `/service-worker.js`

### Icons Not Showing
- Check that icon files exist in `public/icons/`
- Verify image formats (PNG)
- Check browser cache (hard refresh: Ctrl+Shift+R)

### Offline Not Working
- Clear browser cache and reload
- Check Service Worker status in DevTools
- Verify cache strategy in service worker code

### Install Prompt Not Appearing
- Must be served over HTTPS (except localhost)
- Must have valid manifest.json
- User must visit site multiple times (engagement criteria)
- Manifest must define `start_url` and icons

## Next Steps

1. **Add Icons**: Generate and add the two icon files (192x192 and 512x512 PNG)
2. **Test Offline**: Verify offline functionality works as expected
3. **Deploy**: Build and deploy to HTTPS hosting
4. **Install**: Test "Add to Home Screen" functionality
5. **Monitor**: Check service worker cache usage and performance

## Additional Features (Optional)

If needed, you can enhance the PWA with:
- Push notifications (requires subscription)
- Background sync (form submissions when back online)
- Update notifications (custom UI for app updates)
- Share target API (receive shared content)

## References

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev: PWA Checklist](https://web.dev/pwa-checklist/)
- [Can I Use: Service Workers](https://caniuse.com/serviceworkers)

