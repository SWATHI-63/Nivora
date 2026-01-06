# PWA Icons Setup

Your PWA is now ready! However, you need proper app icons for the best mobile experience.

## Icon Requirements:

Create the following icons and place them in the `public` folder:

- **icon-72x72.png** - 72x72 pixels
- **icon-96x96.png** - 96x96 pixels  
- **icon-128x128.png** - 128x128 pixels
- **icon-144x144.png** - 144x144 pixels
- **icon-152x152.png** - 152x152 pixels
- **icon-192x192.png** - 192x192 pixels
- **icon-384x384.png** - 384x384 pixels
- **icon-512x512.png** - 512x512 pixels

## Quick Icon Generation:

### Option 1: Use an Online Tool
Visit https://www.pwabuilder.com/imageGenerator and upload your logo

### Option 2: Use this service
Upload your logo at https://realfavicongenerator.net/

## Update manifest.json:

Once you have the icons, update the icons array in `public/manifest.json`:

\`\`\`json
"icons": [
  {
    "src": "icon-72x72.png",
    "sizes": "72x72",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "icon-96x96.png",
    "sizes": "96x96",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "icon-128x128.png",
    "sizes": "128x128",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "icon-144x144.png",
    "sizes": "144x144",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "icon-152x152.png",
    "sizes": "152x152",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "icon-192x192.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
    "src": "icon-384x384.png",
    "sizes": "384x384",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "icon-512x512.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "any maskable"
  }
]
\`\`\`

Your PWA is ready to use even without custom icons - it will use the SVG logo as fallback.
