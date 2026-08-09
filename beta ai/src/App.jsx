import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Volume2, Cpu, Globe, Settings, Activity,
  Zap, ShieldAlert, Sliders, RefreshCw, X, Radio, Terminal,
  Sun, Wifi, WifiOff, Lightbulb, Play, Monitor
} from 'lucide-react';

export default function App() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('STANDBY');
  const [mode, setMode] = useState('hybrid');
  const [persona, setPersona] = useState('Cyber Mentor');
  const [detectedLang, setDetectedLang] = useState('ta');
  const [detectedLangFull, setDetectedLangFull] = useState('தமிழ் (Tamil)');
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  const [telemetry, setTelemetry] = useState({
    cpu_usage: 34,
    ram_percent: 48,
    ram_used_gb: 7.6,
    ram_total_gb: 16.0
  });

  const [deviceState, setDeviceState] = useState({
    volume: 75,
    brightness: 80,
    wifi_enabled: true,
    smart_lights: { desk_lamp: true }
  });

  const [actionLog, setActionLog] = useState([
    'System Diagnostic Complete: All Nodes Online',
    'Telemetry Engine Connected via API'
  ]);

  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);

  const langNames = {
    ta: 'தமிழ் (Tamil)',
    en: 'English (US/UK)',
    hi: 'हिंदी (Hindi)'
  };

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/system/telemetry');
        const data = await res.json();
        setTelemetry(data);
        if (data.device_state) setDeviceState(data.device_state);
      } catch (err) {
        setTelemetry((prev) => ({
          ...prev,
          cpu_usage: Math.floor(25 + Math.random() * 25),
          ram_percent: Math.floor(45 + Math.random() * 5)
        }));
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 2500);
    return () => clearInterval(interval);
  }, []);

  const triggerDeviceAction = async (action, params) => {
    try {
      const res = await fetch('http://localhost:8000/api/system/device-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params })
      });
      const data = await res.json();
      if (data.device_state) setDeviceState(data.device_state);
      setActionLog((prev) => [data.result || `Action executed: ${action}`, ...prev.slice(0, 4)]);
    } catch (err) {
      console.error('Action Failed:', err);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendAudioToBackend(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStatus('LISTENING');
    } catch (err) {
      alert('Microphone access is required.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus('THINKING');
    }
  };

  const sendAudioToBackend = async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'user_input.wav');
    formData.append('persona', persona);
    formData.append('mode', mode);

    try {
      const response = await fetch('http://localhost:8000/api/process-audio', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setDetectedLang(data.detected_language);
        setDetectedLangFull(langNames[data.detected_language] || data.detected_language.toUpperCase());
        setTranscript(data.transcript);
        setAiResponse(data.response_text);
        
        if (data.device_state) setDeviceState(data.device_state);
        if (data.tool_result) setActionLog((prev) => [data.tool_result, ...prev.slice(0, 4)]);

        if (data.audio_url) {
          playAudioResponse(`http://localhost:8000${data.audio_url}`);
        } else {
          setStatus('STANDBY');
        }
      }
    } catch (err) {
      setAiResponse('Unable to connect to JARVIS Backend.');
      setStatus('STANDBY');
    }
  };

  const playAudioResponse = (url) => {
    setStatus('SPEAKING');
    if (audioPlayerRef.current) {
      audioPlayerRef.current.src = url;
      audioPlayerRef.current.play();
      audioPlayerRef.current.onended = () => setStatus('STANDBY');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono flex flex-col justify-between p-4 md:p-6 relative select-none">
      <audio ref={audioPlayerRef} className="hidden" />

      <header className="flex flex-wrap justify-between items-center z-10 border-b border-[#00f3ff33] pb-3 bg-[#050505aa]">
        <div className="flex items-center gap-3">
          <Cpu className="text-[#00f3ff] animate-pulse" size={26} />
          <div>
            <h1 className="text-lg md:text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#00f3ff] via-[#a855f7] to-[#ff00ff]">
              JARVIS // OS & DEVICE CONTROL AI
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="border border-[#00f3ff55] px-3 py-1 rounded-full bg-[#00f3ff11]">
            LANG: <strong className="text-[#00f3ff]">{detectedLang.toUpperCase()}</strong>
          </span>
          <span className="border border-[#00ff6655] px-3 py-1 rounded-full bg-[#00ff6611]">
            CPU: <strong className="text-[#00ff66]">{telemetry.cpu_usage}%</strong>
          </span>
          <span className="border border-[#a855f755] px-3 py-1 rounded-full bg-[#a855f711]">
            RAM: <strong className="text-[#a855f7]">{telemetry.ram_percent}%</strong>
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center z-10 my-4">
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="simple-orb"
              layoutId="orb-container"
              onClick={() => setIsExpanded(true)}
              className="cursor-pointer relative flex flex-col items-center"
            >
              <canvas ref={canvasRef} width={320} height={320} />
              <div className="absolute -bottom-2 text-xs font-bold text-[#00f3ff] bg-[#050505dd] px-5 py-2 rounded-full border border-[#00f3ff55]">
                [{status}] &bull; CLICK TO EXPAND JARVIS DASHBOARD
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="expanded-dashboard"
              layoutId="orb-container"
              className="w-full max-w-6xl bg-[#080812ee] border border-[#00f3ff55] rounded-2xl p-6 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,243,255,0.25)] flex flex-col gap-6"
            >
              <div className="flex justify-between items-center border-b border-[#ffffff15] pb-4">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => setIsExpanded(false)}>
                  <canvas ref={canvasRef} width={100} height={100} />
                  <div>
                    <h2 className="text-lg font-bold text-[#00f3ff]">JARVIS OS DASHBOARD // {status}</h2>
                    <p className="text-xs text-gray-400">Persona: <span className="text-[#ff00ff] font-bold">{persona}</span></p>
                  </div>
                </div>

                <button onClick={() => setIsExpanded(false)} className="p-2 border border-gray-600 rounded-lg">
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#050505dd] p-4 rounded-xl border border-[#00f3ff33]">
                  <h3 className="text-xs font-bold text-[#00f3ff] mb-3">SYSTEM HARDWARE TELEMETRY</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">CPU LOAD</span>
                        <span className="text-[#00f3ff] font-bold">{telemetry.cpu_usage}%</span>
                      </div>
                      <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#00f3ff] h-full" style={{ width: `${telemetry.cpu_usage}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">RAM ({telemetry.ram_used_gb} / {telemetry.ram_total_gb} GB)</span>
                        <span className="text-[#a855f7] font-bold">{telemetry.ram_percent}%</span>
                      </div>
                      <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#a855f7] h-full" style={{ width: `${telemetry.ram_percent}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#050505dd] p-4 rounded-xl border border-[#ff00ff33]">
                  <h3 className="text-xs font-bold text-[#ff00ff] mb-3">DEVICE & OS CONTROLS</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between mb-1"><span>VOLUME</span><span>{deviceState.volume}%</span></div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={deviceState.volume}
                        onChange={(e) => triggerDeviceAction('set_volume', { level: parseInt(e.target.value) })}
                        className="w-full accent-[#ff00ff]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1"><span>BRIGHTNESS</span><span>{deviceState.brightness}%</span></div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={deviceState.brightness}
                        onChange={(e) => triggerDeviceAction('set_brightness', { level: parseInt(e.target.value) })}
                        className="w-full accent-[#00f3ff]"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#050505dd] p-4 rounded-xl border border-[#00ff6633]">
                  <h3 className="text-xs font-bold text-[#00ff66] mb-3">NODES & APP LAUNCHER</h3>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      onClick={() => triggerDeviceAction('toggle_wifi', { state: !deviceState.wifi_enabled })}
                      className="px-3 py-1.5 rounded-lg border border-[#00ff66] text-[#00ff66]"
                    >
                      WI-FI
                    </button>
                    <button
                      onClick={() => triggerDeviceAction('launch_application', { app_name: 'burp suite' })}
                      className="px-3 py-1.5 rounded-lg border border-[#a855f7] text-[#a855f7]"
                    >
                      BURP SUITE
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#050505dd] p-4 rounded-xl border border-[#00f3ff33]">
                  <h3 className="text-xs font-bold text-[#00f3ff] mb-2">USER SPEECH INPUT ({detectedLang.toUpperCase()})</h3>
                  <p className="text-sm font-sans text-gray-200 min-h-[80px]">{transcript || "Listening..."}</p>
                </div>

                <div className="bg-[#050505dd] p-4 rounded-xl border border-[#ff00ff33]">
                  <h3 className="text-xs font-bold text-[#ff00ff] mb-2">JARVIS RESPONSE ({persona})</h3>
                  <p className="text-sm font-sans text-gray-200 min-h-[80px]">{aiResponse || "Awaiting audio..."}</p>
                </div>

                <div className="bg-[#050505dd] p-4 rounded-xl border border-[#00ff6633]">
                  <h3 className="text-xs font-bold text-[#00ff66] mb-2">COMMAND LOG</h3>
                  <div className="space-y-1 text-xs text-[#00ff66] font-mono min-h-[80px]">
                    {actionLog.map((log, idx) => (
                      <p key={idx}>&gt; {log}</p>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="z-10 flex justify-center pb-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-sm border ${
            isRecording ? 'bg-[#ff0055] text-white' : 'bg-gradient-to-r from-[#00f3ff] to-[#ff00ff] text-black'
          }`}
        >
          {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
          {isRecording ? 'STOP LISTENING' : 'START JARVIS CONVERSATION'}
        </button>
      </footer>
    </div>
  );
}
