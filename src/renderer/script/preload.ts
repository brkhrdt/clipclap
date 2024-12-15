import { contextBridge, ipcRenderer } from 'electron';
import EVENTS from '../../events';
import { Clip } from '../../clip';
import { Configuration } from '../../settings';

type ClipboardUpdatedCallback = (
    event: Electron.IpcRendererEvent,
    history: Clip
) => void;

type LoadConfigCallback = (
    event: Electron.IpcRendererEvent,
    config: Configuration
) => void;

// NOTE: Need to add function into window.d.ts for typescript
contextBridge.exposeInMainWorld('electron', {
    onLoadConfig: (callback: LoadConfigCallback) => {
        ipcRenderer.on(EVENTS.LOAD_CONFIG, callback);
    },
    onClipboardUpdated: (callback: ClipboardUpdatedCallback) => {
        ipcRenderer.on(EVENTS.CLIPBOARD_UPDATED, callback);
    },
    filterHistory: (query: string) => {
        return ipcRenderer.invoke(EVENTS.FILTER_HISTORY, query);
    },
    updateClip: (clip: Clip) => {
        ipcRenderer.send(EVENTS.UPDATE_CLIP, clip);
    },
    promptLLM: (prompt: string, context: string) => {
        return ipcRenderer.invoke(EVENTS.PROMPT_LLM, prompt, context);
    },
});
