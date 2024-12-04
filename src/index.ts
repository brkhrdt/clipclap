import { app, BrowserWindow, clipboard, ipcMain } from 'electron';
import { WebContents } from 'electron';
import logger from './logger'; // Import the logger
import EVENTS from './events';
// import { ClipboardHistory } from './history';
import { Clip } from './clip';
import { filterHistory } from './search';
import { ClipboardHistory } from './history';

import LLM from './llm';

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const maxHistorySize = 30;
let clipboardHistory = new ClipboardHistory(maxHistorySize);

const CLIPBOARD_POLL_RATE = 1000;
let CURRENT_FILTER_QUERY = "";

const APP_DIR = app.getAppPath();

let rendererContents: WebContents | null = null;

function createWindow() {
    const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        // nodeIntegration: true, // needed otherwise preload.js fails to require events
        // contextIsolation: false,
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    });

    // TODO: set entire history first, later just add new clips
    rendererContents = win.webContents;
    logger.info(typeof rendererContents);
    win.webContents.send(EVENTS.CLIPBOARD_UPDATED, clipboardHistory.getClips());

    win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    logger.info('Window created and loaded.');
    // run_llm();


    watchClipboard();
}

function watchClipboard() {
    let lastClipboardText = clipboard.readText();
    logger.info('Started monitoring clipboard.');

    let clipCount: number = 0;

    setInterval(() => {
    const currentClipboardText = clipboard.readText();

    if (currentClipboardText && currentClipboardText !== lastClipboardText) {
        clipCount += 1; // Used as ID
        lastClipboardText = currentClipboardText;
        logger.debug(`Clipboard contents: ${lastClipboardText}`)

        const clip: Clip = {id: clipCount, date: new Date, data: currentClipboardText};
        clipboardHistory.addClip(clip);
        logger.debug(`History: ${clipboardHistory}`);

        logger.info('Clipboard updated: ', { text: currentClipboardText });
        updateClipboardOnRenderer();
    }
    }, CLIPBOARD_POLL_RATE);
}

function updateClipboardOnRenderer() {
    if (rendererContents) {
        if (CURRENT_FILTER_QUERY != "") {
            logger.debug(`Active filter: ${CURRENT_FILTER_QUERY}`);
            filterHistory(CURRENT_FILTER_QUERY, clipboardHistory.getClips()).then(
                (filteredHistory) => {
                    rendererContents.send(EVENTS.CLIPBOARD_UPDATED, filteredHistory);
                });
        } else {
            rendererContents.send(EVENTS.CLIPBOARD_UPDATED, clipboardHistory.getClips());
        }
    }
}

function setupIPC() {
    // Bi-directional communication: Handle data fetch request
    ipcMain.handle(EVENTS.PROMPT_LLM, async (event, prompt, text) => {
        logger.debug(`${event} ${prompt}`);
        const baseurl = 'http://localhost:11434/v1';
        const apikey = 'ollama';
        const systemprompt = `You are an expert assistant and will be given some text to modify based on the user\'s request. Only modify the given text. Be concise and do not give any information that is not asked for.\n\nHere is the text:\n${text}`;

        const llm = new LLM(baseurl, apikey, systemprompt);
        return await llm.runLLM(prompt);
    });

    ipcMain.handle(EVENTS.FILTER_HISTORY, async (event, query) => {
        CURRENT_FILTER_QUERY = query;
        logger.debug(`${event} ${query}`);
        return await filterHistory(query, clipboardHistory.getClips());
    });

    // // Uni-directional communication: Handle logging request
    ipcMain.on(EVENTS.UPDATE_CLIP, (event, clip) => {
        logger.debug('Update clip from renderer:', clip);
        clipboardHistory.updateClip(clip);
        updateClipboardOnRenderer();
    });

    // // Periodic updates (can be either uni- or bi-directional)
    // ipcMain.handle('get-system-info', () => {
    //     return { cpu: 'Intel', ram: '16GB' };
    // });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow);
app.whenReady().then(() => {
    createWindow();
    setupIPC();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
