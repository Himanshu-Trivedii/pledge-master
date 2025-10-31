# PWA Troubleshooting Guide

## Why "Add to Home Screen" Prompt Not Showing?

The install prompt requires several conditions. Check each one:

### 1. **Generate Icon Files** ⚠️ CRITICAL

Icons are MISSING and this blocks the install prompt!

**Quick Fix:**
1. Open `public/icons/generate-icons.html` in your browser
2. Upload your `public/logos/Gode_Jwellers_Logo.jpg`
3. Click "Generate Icons"
4. Download both PNG files
5. Save them in `public/icons/` as:
   - `icon-192x192.png`
   - `icon-512x512.png`

### 2. HTTPS Requirement

- **Development (localhost)**: Works without HTTPS
- **Production**: MUST use HTTPS (not HTTP!)

**Solutions:**
- Deploy to Netlify, Vercel, Firebase (automatic HTTPS)
- Use ngrok for local testing: `ngrok http 5173`
- Set up SSL certificate on your server

### 3. Service Worker Must Be Registered

Check in browser DevTools:
1. Open DevTools (F12)
2. Go to **Application** tab → **Service Workers**
3. Should see "activated and running"

**If not working:**
- Clear cache and reload
- Check browser console for errors
- Verify service-worker.js is accessible at `/service-worker.js`

### 4. Manifest Must Be Valid

Check in browser DevTools:
1. Go to **Application** tab → **Manifest**
2. No errors should be shown
3. All icons should show valid paths

**Current Issue:** manifest.json had syntax error (now fixed)

### 5. Engagement Criteria (Browser Requirement)

Browsers show install prompt only after:
- User visited site at least 2 times
- Spent some time on site (usually 30+ seconds)
- Not dismissed prompt before

**Solution:** Test by manually triggering:
- Chrome: Settings → Install Gode Jewellers
- Menu → More Tools → Create Shortcut → Open in Window

### 6. Manifest Requirements Checklist

✅ Valid JSON format (fixed)
✅ Has `start_url`
✅ Has valid icons (need to add files)
✅ Has `display` mode
✅ Has `name` and `short_name`

### Testing Checklist

- [ ] Run `npm run dev`
- [ ] Open DevTools → Application → Service Workers (should be registered)
- [ ] Open DevTools → Application → Manifest (check for errors)
- [ ] Check console for errors
- [ ] Visit site multiple times
- [ ] Look for install icon in address bar (desktop Chrome)
- [ ] Test on mobile with HTTPS

## Quick Fix Summary

**Right Now:**
1. Generate icons using `public/icons/generate-icons.html`
2. Save the PNG files in `public/icons/` folder
3. Test in Chrome DevTools → Application tab

## Mobile Testing

**For Android:**
- Open in Chrome
- Menu → "Add to Home screen"
- Should see prompt

**For iOS:**
- Open in Safari
- Share button → "Add to Home Screen"
- Should see prompt

## Still Not Working?

1. Check browser console for errors
2. Verify service worker is running
3. Ensure you're using HTTPS in production
4. Clear site data and reload
5. Try a different browser

## Backend Issue Fix

The Java error suggests the project needs to be rebuilt:

```bash
cd backend
mvn clean install
```

Then restart the application.

