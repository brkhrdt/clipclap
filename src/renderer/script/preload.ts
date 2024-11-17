import { contextBridge, ipcRenderer } from 'electron';
import EVENTS from '../../events';
import { Clip } from '../../clip';

type ClipboardUpdatedCallback = (event: Electron.IpcRendererEvent, history: Clip) => void;

contextBridge.exposeInMainWorld('electron', {
  onClipboardUpdated: (callback: ClipboardUpdatedCallback) => {
    ipcRenderer.on(EVENTS.CLIPBOARD_UPDATED, callback);
  }
});
