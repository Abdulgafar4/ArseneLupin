# Episode Format Guide

This document explains how to format episodes for the Bilingual Reader app.

## Episode Structure

Each episode should be a JavaScript object with the following structure:

```javascript
{
  title: "Episode Title",
  paragraphs: [
    {
      english: "First English paragraph text here...",
      french: "Première traduction française du paragraphe ici..."
    },
    {
      english: "Second English paragraph text here...",
      french: "Deuxième traduction française du paragraphe ici..."
    },
    // ... more paragraphs
  ]
}
```

## Example Episode

Here's a complete example:

```javascript
export const episode1 = {
  title: "Episode 1: The Mysterious Letter",
  paragraphs: [
    {
      english: "It was a dark and stormy night when the letter arrived. The envelope was made of fine parchment, sealed with red wax bearing an unfamiliar crest.",
      french: "C'était une nuit sombre et orageuse lorsque la lettre arriva. L'enveloppe était faite de parchemin fin, scellée avec de la cire rouge portant une crête inconnue."
    },
    {
      english: "Arsène Lupin sat by the fireplace, turning the letter over in his hands. He had received many mysterious communications in his career, but this one felt different.",
      french: "Arsène Lupin était assis près de la cheminée, retournant la lettre dans ses mains. Il avait reçu de nombreuses communications mystérieuses dans sa carrière, mais celle-ci semblait différente."
    }
  ]
}
```

## How to Add Episodes

1. **Create a new file** in `src/data/` directory (e.g., `episode1.js`, `episode2.js`)

2. **Export the episode object**:
   ```javascript
   export const episode1 = {
     title: "Your Episode Title",
     paragraphs: [
       // Your paragraph pairs here
     ]
   }
   ```

3. **Import and use in App.jsx**:
   ```javascript
   import { episode1 } from './data/episode1.js'
   ```

## Formatting Guidelines

- **Title**: Keep it descriptive and clear
- **Paragraphs**: Each paragraph should be a complete thought or scene
- **English text**: Your original English content
- **French text**: The corresponding French translation
- **Length**: Paragraphs can be any length, but shorter paragraphs (2-4 sentences) are easier to read

## Visual Display

When displayed in the app, each paragraph pair will appear as:
- **English paragraph** (with "English" label)
- **French translation** (with "Français" label, shown in italics)
- Each pair is in a card with a left border accent

The episodes are displayed in a single-column, scrolling view with alternating English/French pairs.

## Tips

- Keep paragraphs focused on one idea or scene
- Ensure French translations match the tone and style of the English
- Use proper punctuation and formatting
- Test the episode by clicking "View Example Episode" to see the format

