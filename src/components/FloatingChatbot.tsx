import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Trash2,
  X,
  Mic,
  Square,
  Volume2,
  VolumeX
} from 'lucide-react';
import { ChatMessage, Language, LANGUAGE_OPTIONS } from '../types';
import { translations } from '../translations';
import { saveAdvisoryLog } from '../firebase';

interface FloatingChatbotProps {
  userId?: string;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isOpen: boolean;
  onToggleOpen: (open: boolean) => void;
}

const WELCOME_MESSAGES: Record<Language, string> = {
  en: "Hello Farmer! I am Voice & AI Krishi Mitra. Tap the microphone to speak or type in English, Kannada, Hindi, Tamil, Telugu, or Marathi.",
  kn: "ನಮಸ್ಕಾರ ರೈತ ಬಂಧುಗಳೇ! ನಾನು 'ಧ್ವನಿ & AI ಕೃಷಿ ಮಿತ್ರ'. ಬೆಳೆ, ಮಣ್ಣು, ನೀರು, ಹವಾಮಾನದ ಬಗ್ಗೆ ಮೈಕ್ ಒತ್ತಿ ಮಾತನಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ.",
  hi: "नमस्कार किसान भाई! मैं 'वॉइस & AI कृषि मित्र' हूँ। फसल, मिट्टी, पानी या मौसम के बारे में माइक दबाकर बोलें या टाइप करें।",
  ta: "வணக்கம் விவசாயி! நான் 'குரல் & AI கிருஷி மித்ரா'. பயிர், மண், நீர் பற்றி மைக் பொத்தானை அழுத்திப் பேசுங்கள் அல்லது தட்டச்சு செய்யுங்கள்.",
  te: "నమస్కారం రైతు మిత్రమా! నేను 'వాయిస్ & AI కృషి మిత్ర'. పంట, నేల, నీటి గురించి మైక్ నొక్కి మాట్లాడండి లేదా టైప్ చేయండి.",
  mr: "नमस्कार शेतकरी मित्रांनो! मी 'व्हॉइस & AI कृषी मित्र' आहे. पीक, माती, पाण्याबद्दल माइक दाबून बोला किंवा टाइप करा."
};

const SUGGESTED_BY_LANG: Record<Language, string[]> = {
  en: ['Which crop suits red loamy soil?', 'Why are crop leaves turning yellow?', 'Best drip schedule for tomato?'],
  kn: ['ಕೆಂಪು ಮಣ್ಣಿಗೆ ಯಾವ ಬೆಳೆ ಸೂಕ್ತ?', 'ಎಲೆಗಳು ಹಳದಿಯಾಗುತ್ತಿವೆ ಏಕೆ?', 'ಟೊಮೆಟೊಗೆ ಹನಿ ನೀರಾವರಿ ಹೇಗೆ?'],
  hi: ['लाल मिट्टी के लिए कौन सी फसल सही है?', 'पत्तियां पीली क्यों पड़ रही हैं?', 'टमाटर के लिए सिंचाई कब करें?'],
  ta: ['செம்மண்ணுக்கு எந்தப் பயிர் சிறந்தது?', 'இலைகள் ஏன் மஞ்சளாகின்றன?', 'தக்காளிக்கு சொட்டு நீர்ப்பாசனம் எப்போது?'],
  te: ['ఎర్ర నేలకు ఏ పంట మంచిది?', 'ఆకులు పసుపు రంగులోకి ఎందుకు మారుతున్నాయి?', 'టమోటాకు డ్రిప్ నీటిపారుదల ఎలా?'],
  mr: ['तांबड्या मातीसाठी कोणते पीक योग्य?', 'पाने पिवळी का पडत आहेत?', 'टोमॅटोला ठिबक सिंचन कधी करावे?']
};

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({
  userId,
  language,
  onLanguageChange,
  isOpen,
  onToggleOpen
}) => {
  const t = translations[language];
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: WELCOME_MESSAGES[language],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping, isTranscribing]);

  // Stop audio playback on unmount
  useEffect(() => {
    return () => {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const stopSpeaking = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    setSpeakingMsgId(null);
  };

  const speakText = async (msgId: string, text: string, lang: Language) => {
    stopSpeaking();
    setVoiceError('');
    setSpeakingMsgId(msgId);

    try {
      const res = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: lang })
      });
      const data = await res.json();
      if (!res.ok || !data.audioBase64) {
        throw new Error(data.error || 'Voice playback failed.');
      }

      const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
      activeAudioRef.current = audio;
      audio.onended = () => setSpeakingMsgId(null);
      audio.onerror = () => {
        setSpeakingMsgId(null);
        setVoiceError('Audio playback failed on this device.');
      };
      await audio.play();
    } catch (err) {
      setSpeakingMsgId(null);
      setVoiceError(err instanceof Error ? err.message : 'Unable to generate voice reply.');
    }
  };

  const handleSend = async (textToSend?: string, shouldAutoSpeak = autoSpeak) => {
    const query = (textToSend ?? input).trim();
    if (!query || isTyping) return;

    setVoiceError('');
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, language })
      });
      const data = await res.json();
      if (!res.ok || !data.reply) {
        throw new Error(data.error || 'AI service returned an error.');
      }

      const aiMsgId = `ai-${Date.now()}`;
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        sender: 'ai',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (userId) {
        saveAdvisoryLog(userId, {
          category: 'voice',
          cropName: '',
          title: query.slice(0, 120),
          summary: data.reply.slice(0, 580),
          metricLabel: LANGUAGE_OPTIONS.find((l) => l.code === language)?.nativeLabel || language,
          language
        }).catch((e) => console.error('Failed to log voice chat:', e));
      }

      if (shouldAutoSpeak) {
        speakText(aiMsgId, data.reply, language);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to reach AI Krishi Mitra.';
      setVoiceError(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: msg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = String(reader.result || '');
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to read recorded audio.'));
      reader.readAsDataURL(blob);
    });

  const startRecording = async () => {
    setVoiceError('');
    stopSpeaking();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';
      const recorder = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const mimeType = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size < 500) {
          setVoiceError('Recording was too short. Hold or speak clearly and try again.');
          return;
        }

        setIsTranscribing(true);
        try {
          const audioBase64 = await blobToBase64(audioBlob);
          const res = await fetch('/api/voice/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioBase64, mimeType, language })
          });
          const data = await res.json();
          if (!res.ok || !data.transcript) {
            throw new Error(data.error || 'Voice transcription failed.');
          }
          await handleSend(data.transcript, true);
        } catch (err) {
          setVoiceError(err instanceof Error ? err.message : 'Unable to transcribe voice.');
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setVoiceError('Microphone permission denied or unavailable on this browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    stopSpeaking();
    setVoiceError('');
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: WELCOME_MESSAGES[language],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen && (
        <button
          type="button"
          onClick={() => onToggleOpen(true)}
          className="flex items-center gap-2.5 bg-emerald-900 hover:bg-emerald-950 text-white px-4 py-3 rounded-full shadow-xl border border-emerald-700 transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-emerald-100">
            <Mic className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm whitespace-nowrap">{t.chatTitle}</span>
        </button>
      )}

      {isOpen && (
        <div className="w-[340px] sm:w-[410px] h-[560px] bg-white rounded-2xl shadow-2xl border border-emerald-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-950 text-white p-3.5 border-b border-emerald-800 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-100 shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm leading-tight truncate">{t.chatTitle}</h3>
                  <p className="text-[11px] text-emerald-300 truncate">
                    Voice & Text in 6 Languages
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (autoSpeak) stopSpeaking();
                    setAutoSpeak(!autoSpeak);
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                    autoSpeak
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-900 text-emerald-300'
                  }`}
                  title={t.voiceAutoSpeak}
                >
                  {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{t.voiceAutoSpeak}</span>
                </button>
                <button
                  type="button"
                  onClick={clearChat}
                  className="p-1.5 rounded-lg hover:bg-emerald-800 text-emerald-200 transition-colors cursor-pointer"
                  title={t.clearChat}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onToggleOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-emerald-800 text-emerald-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Language Switcher inside Voice AI */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => onLanguageChange(opt.code)}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    language === opt.code
                      ? 'bg-emerald-500 text-emerald-950'
                      : 'bg-emerald-900/90 text-emerald-200 hover:bg-emerald-800'
                  }`}
                >
                  {opt.nativeLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-stone-50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-800 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3 leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-emerald-800 text-white rounded-br-none'
                      : 'bg-white border border-stone-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                  <div className="mt-1.5 flex items-center justify-between gap-3">
                    {msg.sender === 'ai' ? (
                      <button
                        type="button"
                        onClick={() =>
                          speakingMsgId === msg.id
                            ? stopSpeaking()
                            : speakText(msg.id, msg.text, msg.language || language)
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 cursor-pointer"
                      >
                        {speakingMsgId === msg.id ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span />
                    )}
                    <span
                      className={`text-[10px] font-mono-tabular opacity-70 ${
                        msg.sender === 'user' ? 'text-emerald-200' : 'text-gray-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {(isTyping || isTranscribing) && (
              <div className="flex gap-2 items-center text-gray-500 text-xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-800 flex items-center justify-center text-white shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-stone-200 rounded-2xl px-3.5 py-2 text-gray-600">
                  {isTranscribing ? t.voiceTranscribing : t.typing}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {voiceError && (
            <div className="px-3 py-1.5 bg-rose-50 border-t border-rose-200 text-rose-800 text-[11px]">
              {voiceError}
            </div>
          )}

          {/* Preset Suggested Questions */}
          <div className="px-3 py-2 bg-white border-t border-stone-100 overflow-x-auto whitespace-nowrap flex items-center gap-1.5">
            {SUGGESTED_BY_LANG[language].map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                className="text-[11px] bg-stone-100 hover:bg-emerald-50 text-emerald-900 border border-stone-200 px-2.5 py-1 rounded-lg font-medium shrink-0 transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input + Voice Microphone Bar */}
          <div className="p-2.5 bg-white border-t border-stone-200 flex items-center gap-2">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTyping || isTranscribing}
              className={`p-2.5 rounded-xl transition-colors shrink-0 cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
              }`}
              title={isRecording ? t.voiceListening : t.voiceListenBtn}
            >
              {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? t.voiceListening : t.chatPlaceholder}
              disabled={isRecording}
              className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping || isRecording}
              className="bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
