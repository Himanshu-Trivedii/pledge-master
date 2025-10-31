# Mobile Setup Guide for Gode Jewellers PWA

## Quick Setup for Mobile Testing

### Option 1: Same Network (Recommended for Testing)

**Step 1: Find Your Computer's IP Address**

**Windows:**
```powershell
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)
```

**Mac/Linux:**
```bash
ifconfig
# Look for inet (e.g., 192.168.1.100)
```

**Step 2: Start Backend**
```bash
cd backend
mvn spring-boot:run
# Or in your IDE, run PledgeMasterApplication
```

**Step 3: Start Frontend**
```bash
npm run dev
```

**Step 4: Access from Mobile**
1. Connect mobile to same WiFi network
2. Open Chrome on mobile
3. Visit: `http://YOUR_IP_ADDRESS:5173`
   - Example: `http://192.168.1.100:5173`
4. Login should work!

**Step 5: Add to Home Screen**
1. Chrome Menu (⋮) → "Add to Home screen"
2. Safari: Share (□↑) → "Add to Home Screen"

### Option 2: Use ngrok (For Quick Testing Anywhere)

**Install ngrok:**
```bash
# Download from https://ngrok.com/download
# Or with npm:
npm install -g ngrok
```

**Create tunnels for both frontend and backend:**

Terminal 1 (Backend):
```bash
ngrok http 8099
# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

Terminal 2 (Frontend):
```bash
npm run dev  # Start on 5173
ngrok http 5173
# Copy the HTTPS URL
```

**Update API URL:**
1. Open frontend in browser
2. Press F12 → Console
3. Run:
```javascript
localStorage.setItem('apiUrl', 'https://YOUR_BACKEND_NGROK_URL/api');
// Example: localStorage.setItem('apiUrl', 'https://abc123.ngrok.io/api');
```
4. Reload page

## Testing the PWA

### 1. Generate Icons
1. Open: `public/icons/generate-icons.html`
2. Upload your logo
3. Download both PNG files
4. Save in `public/icons/`:
   - `icon-192x192.png`
   - `icon-512x512.png`

### 2. Check Service Worker
- Chrome DevTools → Application → Service Workers
- Should show "activated and running"

### 3. Check Manifest
- Chrome DevTools → Application → Manifest
- Should show all icons as valid

### 4. Test Install Prompt
- Mobile Chrome: Menu → "Add to Home screen"
- Mobile Safari: Share → "Add to Home Screen"

## Production Deployment (For Client Delivery)

### Deploy to Netlify (Automatic HTTPS)

1. **Build frontend:**
```bash
npm run build
```

2. **Create netlify.toml:**
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build]
  publish = "dist"
```

3. **Deploy:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

4. **Configure Backend API:**
- In Netlify dashboard → Site settings → Environment variables
- Add `VITE_API_URL=https://your-backend-api.com/api`

### Alternative: Vercel
```bash
npm install -g vercel
vercel --prod
```

## Troubleshooting

### "Login not working on mobile"
- Check if backend is accessible from mobile
- Verify API URL in browser console:
```javascript
localStorage.getItem('apiUrl')
```
- Open DevTools → Network tab to see failed requests

### "Can't connect to backend"
- Ensure backend is running: `cd backend && mvn spring-boot:run`
- Check firewall settings
- Verify both devices on same network
- Try ngrok method instead

### "Icons not showing"
- Generate icons using `generate-icons.html`
- Clear browser cache
- Hard refresh: Ctrl+Shift+R

### "Add to Home Screen not working"
- Must use HTTPS in production (Netlify/Vercel provide this)
- Ensure service worker is registered
- Check manifest is valid
- Visit site multiple times (engagement criteria)

## Quick Test Commands

```bash
# Start backend
cd backend && mvn spring-boot:run

# Start frontend
npm run dev

# Check your IP
ipconfig  # Windows
ifconfig  # Mac/Linux

# Test on mobile
# Visit: http://YOUR_IP:5173
```

## Network Configuration

If mobile can't connect:

**Windows Firewall:**
1. Open Windows Defender Firewall
2. Allow apps → Java/Cmd/JVM.exe through firewall

**Backend Server:**
1. Edit `backend/src/main/resources/application.properties`
2. Ensure: `server.address=0.0.0.0` (already set)

## Demo Instructions for Client

When presenting to client:

1. **Connect to same WiFi** (or use ngrok)
2. Open app on tablet/mobile
3. Show "Add to Home Screen" feature
4. Demonstrate login, customer management, pledges
5. Show it works offline (after initial load)

The app will automatically detect the network and connect to the backend!

