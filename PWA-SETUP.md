# PWA Setup Instructions

This app is now configured as a Progressive Web App (PWA) and can be installed on any device.

## Features Implemented

✅ **Installable** - Users can add the app to their home screen  
✅ **Offline Support** - Service worker caches app for offline access  
✅ **App-like Experience** - Runs in standalone mode without browser UI  
✅ **iOS Support** - Full Apple mobile web app support  
✅ **Android Support** - Native install prompt and shortcuts  
✅ **Safe Area Support** - Respects device notches and rounded corners  

## Generating App Icons

The app needs two icon files: `icon-192.png` and `icon-512.png` in the root directory.

### Option 1: Use the Icon Generator (Recommended)

1. Open `generate-icons.html` in a web browser
2. Right-click each canvas image
3. Select "Save Image As..."
4. Save as `icon-192.png` and `icon-512.png` respectively
5. Place both files in the root directory of the project

### Option 2: Use Your Own Icons

If you have custom icons:
- Create a 192x192px PNG named `icon-192.png`
- Create a 512x512px PNG named `icon-512.png`
- Both should have transparent or rounded backgrounds
- Place them in the root directory

## Testing PWA Installation

### Chrome Desktop
1. Open the app in Chrome
2. Look for the install icon in the address bar (⊕ icon)
3. Click to install, or use menu → "Install Scruffy Butts..."

### Chrome Android
1. Open the app in Chrome
2. A banner will appear at the bottom prompting installation
3. Or use menu → "Add to Home screen"

### Safari iOS
1. Open the app in Safari
2. Tap the Share button (□ with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Confirm the name and tap "Add"

## Features When Installed

### Android
- App appears in app drawer
- App shortcuts available (long-press icon)
  - New Appointment
  - Point of Sale
  - Customer List
- Splash screen on launch
- No browser chrome
- Back button returns to previous view

### iOS
- App appears on home screen
- Splash screen on launch
- Runs fullscreen without Safari UI
- Status bar matches app theme

## Manifest Shortcuts

The app includes shortcuts for quick access to:
- **New Appointment** - Jump directly to scheduling
- **Point of Sale** - Quick checkout access
- **Customer List** - View and manage customers

## Service Worker Caching

The service worker caches:
- HTML, CSS, and JavaScript files
- API responses (runtime caching)
- Static assets

This enables:
- Faster subsequent loads
- Offline functionality
- Reduced data usage

## Updating the PWA

When you make changes to the app:
1. Update the `CACHE_NAME` version in `sw.js`
2. The service worker will automatically update on next visit
3. Old caches are cleaned up automatically

## Browser Support

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari iOS 11.3+
- ✅ Firefox (with some limitations)
- ✅ Samsung Internet
- ⚠️ Safari macOS (limited support)

## Troubleshooting

**Install prompt not showing?**
- Ensure you're using HTTPS (or localhost)
- Check that `manifest.json` is accessible
- Verify both icon files exist

**Icons not appearing?**
- Clear browser cache
- Check file paths in manifest.json
- Ensure icons are valid PNG format

**Service worker not registering?**
- Check browser console for errors
- Verify `sw.js` is in root directory
- Ensure no conflicting service workers

## Customization

### Change App Colors
Edit `manifest.json`:
- `theme_color` - Browser UI color
- `background_color` - Splash screen background

### Modify App Name
Edit `manifest.json`:
- `name` - Full app name
- `short_name` - Icon label (12 chars max)

### Add More Shortcuts
Edit the `shortcuts` array in `manifest.json`
