# Bilingual Reader - English & French

A beautiful React + Vite web application for reading English text alongside its French translation side by side.

## Features

- 📖 **Side-by-side reading**: View English and French text simultaneously
- 🔄 **Toggle view**: Switch between English and French panels
- 🌐 **Auto-translation**: Automatic translation from English to French using LibreTranslate
- 📋 **Copy to clipboard**: Easy copy functionality for both texts
- 📱 **Responsive design**: Works on desktop, tablet, and mobile devices
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations
- ⚡ **Fast**: Built with Vite for lightning-fast development and builds

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory. You can preview the production build with:

```bash
npm run preview
```

## How to Use

1. **Enter text**: Type or paste English text in the input field
2. **Translate**: Click "Translate to French" to get the French translation
3. **Read**: View both texts side by side
4. **Toggle view**: Use "Toggle View" to switch between English and French panels
5. **Copy text**: Click the 📋 button to copy text from either panel
6. **Keyboard shortcut**: Press `Ctrl/Cmd + Enter` to translate

## Sample Text

Click "Load Sample Text" to see a demonstration with pre-loaded bilingual content.

## Translation Service

The app uses LibreTranslate (https://libretranslate.de/) for free translation. This service:
- Requires no API key
- Is free to use
- May have rate limits for heavy usage

For production use, you might want to:
- Use Google Translate API (requires API key)
- Use DeepL API (requires API key, better quality)
- Set up your own LibreTranslate instance

## Customization

You can easily customize:
- Colors and styling in `src/App.css`
- Translation service in `src/App.jsx` (translateText function)
- Sample texts in `src/App.jsx` (sampleTexts object)

## Tech Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **CSS3**: Custom styling with gradients and animations

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge
- Firefox
- Safari
- Opera

## File Structure

```
ArseneLupin/
├── src/
│   ├── App.jsx         # Main React component
│   ├── App.css         # Component styles
│   ├── main.jsx        # React entry point
│   └── index.css       # Global styles
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Future Enhancements

- Save and load text pairs
- Multiple language support
- Text-to-speech for both languages
- Highlight corresponding sentences
- Export to PDF
- Dark mode
- Local storage for saved translations

Enjoy reading bilingually! 📚
