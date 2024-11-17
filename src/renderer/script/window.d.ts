import { Clip } from '../../clip';
export {};

declare global {
  interface Window {
    electron: {
      onClipboardUpdated: (callback: (event: Event, history: Clip[]) => void) => void;
      // getClipboardHistory: () => Promise<string[]>;
    };
  }
}
