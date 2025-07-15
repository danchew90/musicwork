declare module 'react-native-audio-record' {
    interface AudioRecordOptions {
      sampleRate: number;
      channels: number;
      bitsPerSample: number;
      audioSource: number;
      wavFile: string;
    }
  
    class AudioRecord {
      constructor(options: AudioRecordOptions);
      init(): void;
      start(): void;
      stop(): Promise<string>;
      on(event: 'data', listener: (data: string) => void): { remove: () => void };
    }
  
    export default AudioRecord;
  }
  