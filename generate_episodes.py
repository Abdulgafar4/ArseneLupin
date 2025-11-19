#!/usr/bin/env python3
"""
Script to parse episode.md and generate episodes.js with French translations
"""

import re
import json

def split_into_paragraphs(text):
    """Split text into paragraphs, removing empty lines"""
    paragraphs = []
    current = []
    
    for line in text.split('\n'):
        line = line.strip()
        if line:
            current.append(line)
        elif current:
            paragraphs.append(' '.join(current))
            current = []
    
    if current:
        paragraphs.append(' '.join(current))
    
    return paragraphs

def translate_to_french(text):
    """Placeholder for translation - in production, use a translation API"""
    # For now, return a placeholder that indicates translation needed
    # You can integrate with Google Translate API, DeepL, or LibreTranslate here
    return f"[FRENCH TRANSLATION NEEDED: {text[:50]}...]"

def parse_episodes(markdown_content):
    """Parse markdown content and extract episodes"""
    episodes = []
    
    # Split by PART markers
    parts = re.split(r'ARSEN LUPIN — AUTOBIOGRAPHY \(PART (\d+)\)', markdown_content)
    
    for i in range(1, len(parts), 2):
        if i + 1 < len(parts):
            part_num = parts[i]
            content = parts[i + 1].strip()
            
            # Remove markdown formatting
            content = re.sub(r'\*\*', '', content)
            content = re.sub(r'\([^)]+\)', '', content)
            
            paragraphs = split_into_paragraphs(content)
            
            episode = {
                'title': f"Arsen Lupin — Autobiography (Part {part_num})",
                'paragraphs': []
            }
            
            for para in paragraphs:
                if para and len(para) > 20:  # Filter out very short lines
                    episode['paragraphs'].append({
                        'english': para,
                        'french': translate_to_french(para)
                    })
            
            if episode['paragraphs']:
                episodes.append(episode)
    
    return episodes

if __name__ == '__main__':
    with open('src/Episode/episode.md', 'r', encoding='utf-8') as f:
        content = f.read()
    
    episodes = parse_episodes(content)
    print(f"Found {len(episodes)} episodes")
    print(json.dumps(episodes[0] if episodes else {}, indent=2, ensure_ascii=False))

