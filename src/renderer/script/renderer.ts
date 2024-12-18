import { basicSetup, minimalSetup, EditorView } from 'codemirror';
import {EditorState, Compartment} from "@codemirror/state"
import { highlightWhitespace, lineNumbers } from '@codemirror/view';

import { Clip } from '../../clip';
import { Configuration } from '../../settings';

import '../css/style.css';

// Globals
let currentClip: Clip | null = null; // clip being edited
let CONFIG: Configuration = null;

// Set up the search input listener
const searchInput = document.getElementById('searchInput') as HTMLInputElement;
const promptInput = document.getElementById('promptInput') as HTMLInputElement;

// Listen for changes in the search input field
searchInput.addEventListener('input', async () => {
    const query = searchInput.value;
    const newHistory = await window.electron.filterHistory(query); // Update search results based on input value
    console.log('new hist', newHistory);
    updateHistory(newHistory);
});

// Listen for changes in the prompt input field
promptInput.addEventListener('keyup', async (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        const prompt = promptInput.value;
        const newDoc = await window.electron.promptLLM(
            prompt,
            editor.state.doc.toString()
        );
        console.log('new doc from llm', newDoc);
        editor.dispatch({
            changes: {
                from: 0,
                to: editor.state.doc.length,
                insert: newDoc,
            },
        });
    }
});

// Disable 'Enter' key from creating a newline
promptInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
    }
});

// Save button from editor back to clip
const saveButton = document.getElementById('save-button') as HTMLInputElement;
saveButton.addEventListener('click', async () => {
    if (currentClip !== null) {
        currentClip.data = editor.state.doc.toString();
        window.electron.updateClip(currentClip);
    }
});

//
// Prompt input
//
// Prompt text field, expand as text is entered
const textarea = document.querySelector('#promptInput') as HTMLInputElement;
function resizeTextarea() {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}
textarea.addEventListener('input', resizeTextarea);
resizeTextarea();

//
// Drag divider bar
//
// Drag bar to resize clipboard history and editor columns
const resizeBar = document.querySelector('.column-resize-bar') as HTMLElement;
const leftColumn = document.querySelector('.column-left') as HTMLElement;
const rightColumn = document.querySelector('.column-right') as HTMLElement;
const container = document.querySelector('.container') as HTMLElement;

let isResizing: boolean = false;
let lastDownX: number = 0;

// Mouse down event to start resizing
resizeBar.addEventListener('mousedown', (e: MouseEvent): void => {
    isResizing = true;
    lastDownX = e.clientX;
    document.body.style.userSelect = 'none'; // Disable text selection during drag
});

// Mouse move event to resize columns
document.addEventListener('mousemove', (e: MouseEvent): void => {
    if (!isResizing) return;

    const offsetRight: number =
        container.offsetWidth - (e.clientX - container.offsetLeft);
    const newLeftWidth: number = e.clientX - container.offsetLeft;

    // Ensure the columns have a minimum width
    const minWidth: number = 100;
    if (newLeftWidth >= minWidth && offsetRight >= minWidth) {
        leftColumn.style.width = `${newLeftWidth}px`;
        rightColumn.style.width = `${container.offsetWidth - newLeftWidth - resizeBar.offsetWidth}px`;
    }
});

// Mouse up event to stop resizing
document.addEventListener('mouseup', (): void => {
    isResizing = false;
    document.body.style.userSelect = 'auto'; // Re-enable text selection
});

//
// Clipboard
//
function updateHistory(history: Clip[]): void {
    const historyElement = document.getElementById('history');

    if (historyElement) {
        historyElement.innerHTML = '';

        history.forEach((item: Clip) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('history-item');

            const contentDiv = document.createElement('div');
            contentDiv.classList.add('history-content');

            const textDiv = document.createElement('div');
            textDiv.classList.add('history-text');
            // textDiv.textContent = item.data;
            // let hlWs = new Compartment;
            let textBox = new EditorView({
                doc: item.data,
                extensions: [
                    minimalSetup, // Enable basic editing features
                    // highlightWhitespace(),
                    EditorView.lineWrapping,
                    EditorView.editable.of(false),
                ],
                parent: textDiv,
            });

            const dateDiv = document.createElement('div');
            dateDiv.classList.add('history-date');
            dateDiv.textContent = item.date.toLocaleString();

            const buttonDiv = document.createElement('div');
            buttonDiv.classList.add('history-item-button-container');

            const copyButton = document.createElement('button');
            copyButton.classList.add('history-item-button');
            copyButton.classList.add('copy-button');
            copyButton.textContent = '⧉';
            copyButton.addEventListener('click', () => {
                navigator.clipboard
                    .writeText(item.data)
                    .then(() => {
                        console.log('Text copied to clipboard');
                    })
                    .catch((err) => {
                        console.error('Error copying text: ', err);
                    });
            });
            const addButton = document.createElement('button');
            addButton.classList.add('history-item-button');
            addButton.classList.add('add-button');
            addButton.textContent = '+';
            addButton.addEventListener('click', () => {
                // TODO: Reset the editor undo history:

                currentClip = item;
                editor.dispatch({
                    changes: {
                        from: editor.state.doc.length,
                        to: editor.state.doc.length,
                        insert: item.data,
                    },
                });
            });

            buttonDiv.appendChild(copyButton);
            buttonDiv.appendChild(addButton);

            contentDiv.appendChild(textDiv);
            contentDiv.appendChild(dateDiv);

            itemDiv.appendChild(contentDiv);
            itemDiv.appendChild(buttonDiv);

            historyElement.appendChild(itemDiv);
        });
    } else {
        console.error("Element with id 'history' not found.");
    }
}

window.electron.onClipboardUpdated((event: Event, history: Clip[]) => {
    updateHistory(history);
});

window.electron.onLoadConfig((event: Event, config: Configuration) => {
    CONFIG = config; // set global

    editor.dispatch({
        effects: lineWrapCompartment.reconfigure(CONFIG.lineWrap ? EditorView.lineWrapping : [])
    })
    editor.dispatch({
        effects: lineNumberCompartment.reconfigure(CONFIG.lineNumbers ? lineNumbers() : [])
    })
});

const initialText = '';
const targetElement = document.querySelector('#editor')!;

const lineWrapCompartment = new Compartment();
const lineNumberCompartment = new Compartment();

let editor = new EditorView({
    doc: initialText,
    extensions: [
        basicSetup,
        lineWrapCompartment.of(EditorView.lineWrapping),
        lineNumberCompartment.of(lineNumbers())
    ],
    parent: targetElement,
});
