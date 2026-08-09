#!/usr/bin/env bash
set -e

echo "============================================================"
echo "  ⚡ JARVIS CYBERPUNK OS & DEVICE CONTROL AI AGENT SETUP ⚡  "
echo "============================================================"

if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate || source venv/Scripts/activate

pip install --upgrade pip
pip install fastapi uvicorn faster-whisper edge-tts httpx pydantic python-multipart psutil

mkdir -p models audio_cache

if [ ! -f "models/ta_IN-valluvar-medium.onnx" ]; then
    curl -L "https://github.com/rhasspy/piper/releases/download/v1.2.0/voice-ta_IN-valluvar-medium.tar.gz" -o models/ta_voice.tar.gz
    tar -xvf models/ta_voice.tar.gz -C models/
    rm -f models/ta_voice.tar.gz
fi

if [ ! -f "models/en_US-lessac-high.onnx" ]; then
    curl -L "https://github.com/rhasspy/piper/releases/download/v1.2.0/voice-en_US-lessac-high.tar.gz" -o models/en_voice.tar.gz
    tar -xvf models/en_voice.tar.gz -C models/
    rm -f models/en_voice.tar.gz
fi

if command -v ollama &> /dev/null; then
    ollama pull qwen2.5:7b || true
fi

echo "✅ SETUP COMPLETE! Run 'python agent.py' to start."
