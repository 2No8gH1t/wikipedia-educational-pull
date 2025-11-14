# Random Educational Wikipedia

A beautiful, modern website that fetches and displays random educational Wikipedia articles with summaries.

## Features

- 🎲 Fetches random Wikipedia articles using Wikipedia's REST API
- 📚 Filters for educational content
- 📝 Displays article summaries
- 🖼️ Shows article thumbnails when available
- 🔗 Direct links to full Wikipedia articles
- 📱 Fully responsive design
- ⚡ Fast and lightweight

## How to Use

1. **Open the website**: Simply open `index.html` in your web browser
   - You can double-click the file, or
   - Right-click and select "Open with" → Your preferred browser

2. **Get a random article**: 
   - The page automatically loads a random article on page load
   - Click the "Get Random Article" button to fetch a new one

3. **Read the summary**: The article summary is displayed with:
   - Article title
   - Summary text
   - Thumbnail image (if available)
   - Link to the full Wikipedia page
   - Page metadata

## Files

- `index.html` - Main HTML structure
- `style.css` - Styling and layout
- `script.js` - JavaScript functionality for fetching articles

## Technical Details

- Uses Wikipedia's REST API (`/api/rest_v1/page/random/summary`)
- Implements educational content filtering
- No dependencies required - pure HTML, CSS, and JavaScript
- Works offline for the UI, but requires internet connection to fetch articles

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge).

## Notes

- The website requires an active internet connection to fetch articles
- Articles are filtered to prioritize educational content
- If an article doesn't appear educational, the system will retry automatically (up to 10 times)

