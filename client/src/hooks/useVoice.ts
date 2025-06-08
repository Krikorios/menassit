import { useState, useCallback, useRef } from "react";
// Removed circular dependency import
// import { useVoiceContext } from "@/context/VoiceProvider";

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startListening = useCallback(async () => {
    try {
      setIsProcessing(true);
      
      // Check if browser supports speech recognition
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        setIsSupported(false);
        throw new Error('Speech recognition not supported');
      }

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create MediaRecorder for audio capture
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.addEventListener('dataavailable', (event) => {
        chunksRef.current.push(event.data);
      });

      mediaRecorder.addEventListener('stop', async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        
        // In a real implementation, you would send this to your local STT service
        // For now, we'll simulate the process
        setTimeout(() => {
          setTranscription("Voice command processed locally");
          setIsProcessing(false);
        }, 1000);
      });

      setIsListening(true);
      setIsProcessing(false);
      mediaRecorder.start();

      // Auto-stop after 5 seconds for demo
      setTimeout(() => {
        stopListening();
      }, 5000);

      return {
        transcription: "Local voice processing active",
        confidence: 0.95,
        intent: "demo_command",
        actionResult: { type: "voice_activated", message: "Voice system ready" }
      };
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      setIsProcessing(false);
      setIsListening(false);
      throw error;
    }
  }, []);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const speak = useCallback((text: string, language: 'en' | 'ar' = 'en') => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ar' ? 'ar-OM' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  }, []);

  return {
    isListening,
    isProcessing,
    transcription,
    isSupported,
    startListening,
    stopListening,
    speak,
  };
}