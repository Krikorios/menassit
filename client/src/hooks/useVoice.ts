import { useState, useCallback, useRef, useEffect } from "react";
import { voiceProcessor } from "@/lib/voiceProcessor";
import { voiceService } from "@/services/voiceService";
import { useToast } from "@/hooks/use-toast";

interface VoiceResult {
  transcription: string;
  intent?: string;
  confidence: number;
  actionResult?: any;
}

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Check if browser supports voice recording
    setIsSupported(
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      !!navigator.mediaDevices.getUserMedia &&
      !!window.MediaRecorder
    );
  }, []);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice recording",
        variant: "destructive",
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType 
        });
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        // Process the audio
        await processAudio(audioBlob);
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsListening(true);
      setTranscription("");

      toast({
        title: "Listening...",
        description: "Speak your command now",
      });
    } catch (error) {
      console.error("Error starting voice recording:", error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice features",
        variant: "destructive",
      });
    }
  }, [isSupported, toast]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Convert blob to base64 for API transmission
      const audioBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(
        new Uint8Array(audioBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );

      // Send to backend for processing
      const result = await voiceService.processCommand(base64Audio);
      
      setTranscription(result.transcription);
      
      if (result.actionResult) {
        // Show success message based on action type
        const actionType = result.actionResult.type;
        let message = "Command processed successfully";
        
        switch (actionType) {
          case 'task_created':
            message = `Task "${result.actionResult.task.title}" created`;
            break;
          case 'expense_added':
            message = `Expense of $${result.actionResult.record.amount} added`;
            break;
          case 'income_added':
            message = `Income of $${result.actionResult.record.amount} recorded`;
            break;
          default:
            message = "Command executed successfully";
        }
        
        toast({
          title: "Voice command successful",
          description: message,
        });
      } else if (result.transcription) {
        toast({
          title: "Voice transcribed",
          description: result.transcription,
        });
      }

      return result;
    } catch (error) {
      console.error("Error processing audio:", error);
      toast({
        title: "Voice processing failed",
        description: "Failed to process voice command",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const speak = useCallback(async (text: string, voice?: string) => {
    try {
      const audioBlob = await voiceService.speak(text, voice);
      
      // Play the audio
      const audio = new Audio(URL.createObjectURL(audioBlob));
      await audio.play();
      
      return true;
    } catch (error) {
      console.error("Error with text-to-speech:", error);
      toast({
        title: "Speech synthesis failed",
        description: "Failed to convert text to speech",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

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
