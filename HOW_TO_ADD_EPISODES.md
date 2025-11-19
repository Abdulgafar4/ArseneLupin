# How to Add Your Episodes

## Format

Each episode needs to follow this structure:

```javascript
{
  title: "Episode X: Your Episode Title",
  paragraphs: [
    {
      english: "Your English paragraph here...",
      french: "Votre traduction française ici..."
    },
    {
      english: "Next English paragraph...",
      french: "Prochaine traduction française..."
    }
    // ... more paragraphs
  ]
}
```

## Where to Add Episodes

1. **Option 1: Provide me the English text**
   - Just paste your English episodes
   - I'll format them and add French translations
   - I'll update the `src/data/episodes.js` file

2. **Option 2: Add them yourself**
   - Edit `src/data/episodes.js`
   - Add your episodes to the `allEpisodes` array
   - Each episode should have a `title` and `paragraphs` array

## Example

```javascript
export const episode2 = {
  title: "Episode 2: The Adventure Begins",
  paragraphs: [
    {
      english: "The morning sun cast long shadows across the cobblestone streets...",
      french: "Le soleil du matin projetait de longues ombres sur les rues pavées..."
    },
    {
      english: "Lupin adjusted his hat and stepped into the bustling market...",
      french: "Lupin ajusta son chapeau et entra dans le marché animé..."
    }
  ]
}
```

## How to Provide Your Episodes

You can:
1. **Paste the English text** - I'll format it and translate to French
2. **Send one episode at a time** - Easier to manage
3. **Include the episode number and title** - So I can label them correctly

Just paste your English episodes and I'll take care of the rest!

