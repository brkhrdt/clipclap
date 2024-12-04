import { contextBridge, ipcRenderer } from 'electron';
import EVENTS from '../../events';
import { Clip } from '../../clip';

type ClipboardUpdatedCallback = (event: Electron.IpcRendererEvent, history: Clip) => void;

// NOTE: Need to add function into window.d.ts for typescript
contextBridge.exposeInMainWorld('electron', {
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
    }
});
