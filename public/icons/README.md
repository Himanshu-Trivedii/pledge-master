# PWA Icons

This directory should contain the app icons for the PWA manifest.

## Required Icons

You need to add two PNG icons here:

1. **icon-192x192.png** - 192x192 pixels
2. **icon-512x512.png** - 512x512 pixels

## Quick Setup

You can convert an existing logo to create these icons:

### Option 1: Using Online Tools
- Visit https://www.pwabuilder.com/imageGenerator
- Upload your logo (e.g., `../logos/Gode_Jwellers_Logo.jpg`)
- Generate and download the icons

### Option 2: Using ImageMagick (if installed)
```bash
# Convert to 192x192
magick convert ../logos/Gode_Jwellers_Logo.jpg -resize 192x192 -background white -gravity center -extent 192x192 icon-192x192.png

# Convert to 512x512
magick convert ../logos/Gode_Jwellers_Logo.jpg -resize 512x512 -background white -gravity center -extent 512x512 icon-512x512.png
```

### Option 3: Using Any Image Editor
1. Open your logo
2. Create a square canvas (192x192 or 512x512)
3. Center the logo
4. Export as PNG with transparent or white background

## Icon Specifications

- **Format**: PNG with transparency or solid background
- **Purpose**: Should be "maskable" (safe area for icon content)
- **Background**: Solid color preferred (white or gold #F5A623)
- **Content**: Logo centered with padding on all sides

## Note

The manifest.json is already configured to look for these files. Add the actual icon files to enable the full PWA experience.

