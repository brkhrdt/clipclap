import { app, BrowserWindow, clipboard, ipcMain } from 'electron';
import { WebContents } from 'electron';
import logger from './logger'; // Import the logger
import EVENTS from './events';
// import { ClipboardHistory } from './history';
import { Clip } from './clip';

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let clipboardHistory: Clip[] = [];
const maxHistorySize = 30;

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
    win.webContents.send(EVENTS.CLIPBOARD_UPDATED, clipboardHistory);

    win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    logger.info('Window created and loaded.');

    watchClipboard();
}

function watchClipboard() {
    let lastClipboardText = clipboard.readText();
    logger.info('Started monitoring clipboard.');

    setInterval(() => {
    const currentClipboardText = clipboard.readText();

    if (currentClipboardText && currentClipboardText !== lastClipboardText) {
        lastClipboardText = currentClipboardText;
        logger.debug(`Clipboard contents: ${lastClipboardText}`)

        const clip: Clip = {date: new Date, data: currentClipboardText};
        clipboardHistory.unshift(clip);
        if (clipboardHistory.length > maxHistorySize) {
            clipboardHistory.pop();
        }
        logger.debug(`History: ${clipboardHistory}`);

        logger.info('Clipboard updated: ', { text: currentClipboardText });
        if (rendererContents) {
            rendererContents.send(EVENTS.CLIPBOARD_UPDATED, clipboardHistory);
        }
    }
    }, 1000);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

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
