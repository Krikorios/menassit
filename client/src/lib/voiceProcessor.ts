/**
 * Voice processing utilities for local audio handling
 * Provides audio format conversion and preprocessing for STT models
 */

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  bitDepth: number;
}

export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  sampleRate: 16000, // Common for STT models
  channels: 1, // Mono
  bitDepth: 16,
};

export class VoiceProcessor {
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== "undefined" && window.AudioContext) {
      this.audioContext = new AudioContext();
    }
  }

  /**
   * Convert audio blob to PCM format suitable for STT processing
   */
  async convertToPCM(audioBlob: Blob, config: AudioConfig = DEFAULT_AUDIO_CONFIG): Promise<Float32Array> {
    if (!this.audioContext) {
      throw new Error("AudioContext not supported");
    }

    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    
    // Resample if necessary
    const resampled = this.resample(audioBuffer, config.sampleRate);
    
    // Convert to mono if necessary
    const mono = config.channels === 1 ? this.convertToMono(resampled) : resampled;
    
    return mono.getChannelData(0);
  }

  /**
   * Resample audio to target sample rate
   */
  private resample(audioBuffer: AudioBuffer, targetSampleRate: number): AudioBuffer {
    if (audioBuffer.sampleRate === targetSampleRate) {
      return audioBuffer;
    }

    const ratio = audioBuffer.sampleRate / targetSampleRate;
    const newLength = Math.floor(audioBuffer.length / ratio);
    const newBuffer = this.audioContext!.createBuffer(
      audioBuffer.numberOfChannels,
      newLength,
      targetSampleRate
    );

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const inputData = audioBuffer.getChannelData(channel);
      const outputData = newBuffer.getChannelData(channel);

      for (let i = 0; i < newLength; i++) {
        const sourceIndex = Math.floor(i * ratio);
        outputData[i] = inputData[sourceIndex];
      }
    }

    return newBuffer;
  }

  /**
   * Convert stereo to mono by averaging channels
   */
  private convertToMono(audioBuffer: AudioBuffer): AudioBuffer {
    if (audioBuffer.numberOfChannels === 1) {
      return audioBuffer;
    }

    const monoBuffer = this.audioContext!.createBuffer(
      1,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    const monoData = monoBuffer.getChannelData(0);
    
    for (let i = 0; i < audioBuffer.length; i++) {
      let sum = 0;
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        sum += audioBuffer.getChannelData(channel)[i];
      }
      monoData[i] = sum / audioBuffer.numberOfChannels;
    }

    return monoBuffer;
  }

  /**
   * Apply noise reduction and audio enhancement
   */
  async enhanceAudio(pcmData: Float32Array): Promise<Float32Array> {
    // Simple noise gate implementation
    const threshold = 0.01;
    const enhanced = new Float32Array(pcmData.length);
    
    for (let i = 0; i < pcmData.length; i++) {
      enhanced[i] = Math.abs(pcmData[i]) > threshold ? pcmData[i] : 0;
    }
    
    return enhanced;
  }

  /**
   * Detect voice activity in audio data
   */
  detectVoiceActivity(pcmData: Float32Array, windowSize: number = 1024): boolean[] {
    const activity: boolean[] = [];
    const energyThreshold = 0.02;
    
    for (let i = 0; i < pcmData.length; i += windowSize) {
      const window = pcmData.slice(i, i + windowSize);
      const energy = this.calculateEnergy(window);
      activity.push(energy > energyThreshold);
    }
    
    return activity;
  }

  /**
   * Calculate RMS energy of audio window
   */
  private calculateEnergy(window: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < window.length; i++) {
      sum += window[i] * window[i];
    }
    return Math.sqrt(sum / window.length);
  }

  /**
   * Convert Float32Array to base64 for API transmission
   */
  pcmToBase64(pcmData: Float32Array): string {
    // Convert to 16-bit PCM
    const int16Array = new Int16Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      int16Array[i] = Math.max(-32768, Math.min(32767, pcmData[i] * 32767));
    }
    
    const buffer = int16Array.buffer;
    const bytes = new Uint8Array(buffer);
    
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return btoa(binary);
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}

export const voiceProcessor = new VoiceProcessor();
