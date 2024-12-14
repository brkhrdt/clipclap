import { Configuration } from '../../settings';
import { Clip } from '../../clip';
export {};

declare global {
    interface Window {
        electron: {
            onLoadConfig: (
                callback: (event: Event, config: Configuration) => void
            ) => void;
            onClipboardUpdated: (
                callback: (event: Event, history: Clip[]) => void
            ) => void;
            filterHistory: (query: string) => Promise<Clip[]>;
            updateClip: (clip: Clip) => void;
            promptLLM: (prompt: string, context: string) => Promise<string>;
        };
    }
}
