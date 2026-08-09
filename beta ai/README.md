# NEXUS // JARVIS Cyberpunk Multilingual AI Voice Agent

A fully offline & hybrid multilingual AI Voice Agent with real-time OS system telemetry, hardware device control, and dynamic persona-infused speech synthesis.

## Features
- **Auto-Language Detection STT:** `faster-whisper` (offline) or Groq Whisper (online).
- **Multilingual LLM Engine:** Ollama `qwen2.5:7b` (offline) or Groq Llama 3.3 70B (online).
- **Persona Speech Synthesis:** Piper ONNX (offline) or Edge-TTS Neural Voices (online) for Tamil, English, and Hindi.
- **JARVIS Device & OS Controls:** System volume, brightness, Wi-Fi toggles, RGB lighting, and application launching.
- **Cyberpunk UI:** Interactive Canvas 3D Rotating Orb with Framer Motion glassmorphic dashboard.

## Quick Start Guide

1. **Extract Zip Archive & Navigate to Directory:**
   ```bash
   unzip nexus-cyberpunk-agent.zip
   cd nexus-cyberpunk-agent
   ```

2. **Run Installer Script:**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Start Python Backend Server:**
   ```bash
   python agent.py
   ```

4. **Launch Frontend Dev Server:**
   ```bash
   npm install
   npm run dev
   ```
