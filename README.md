# Vonni 

**Vonni** is a full-stack web app that models a Vonnadorian narrator (from Matt Haig’s *The Humans*) to translate human speech into literal, analytical, and slightly humorous alien interpretations. Vonni listens for the wake word **“Hey Vonni”**, supports speech-to-text input, and provides tone-aware translations and tone-comparison features.

---

## Attribution & Disclaimer
Vonni is lightly inspired by imagery and themes in Matt Haig’s *The Humans*. This project is **not affiliated with or endorsed by** Matt Haig, his publishers, or any rights holders. Vonni uses a Vonnadorian voice as a creative persona for translation/analysis purposes only.

---

## Features
- Wake-word support: say **“Hey Vonni”** to activate voice capture.  
- Manual mic toggle for immediate speech-to-text.  
- Tone analysis (neutral, sarcastic, polite, angry, etc.).  
- Context selection (workplace, family, school, dating, etc.).  
- Single translation and side-by-side tone comparison modes.  
- Backend proxy to call AI inference APIs securely (API key kept server-side).  
- Graceful fallback if AI service is unavailable.

---

## Tech stack
- Frontend: React (Vite)  
- Backend: Node.js + Express  
- Speech recognition: Browser Web Speech API (webkitSpeechRecognition / SpeechRecognition)  
- Deployment: Render (or any Node-capable host)

---
## Try it out here: https://vonni-2gf2.onrender.com/

