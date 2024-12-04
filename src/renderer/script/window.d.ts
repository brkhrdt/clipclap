import { Clip } from '../../clip';
export {};

declare global {
  interface Window {
    electron: {
      onClipboardUpdated: (callback: (event: Event, history: Clip[]) => void) => void;
        filterHistory: (query: string) => Promise<Clip[]>;
        updateClip: (clip: Clip) => void;
        promptLLM: (prompt: string, context: string) => Promise<string>;
      // getClipboardHistory: () => Promise<string[]>;
    };
  }
}
