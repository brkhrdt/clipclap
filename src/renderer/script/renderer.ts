import { basicSetup, minimalSetup, EditorView } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { highlightWhitespace, lineNumbers } from '@codemirror/view';

import { Clip } from '../../clip';
import { Configuration } from '../../settings';

import Editor from './editor';

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
        document.body.style.cursor = 'wait';
        window.electron.promptLLM(prompt, editor.getText()).then(
            (newDoc) => {
                console.log('new doc from llm', newDoc);
                editor.setText(newDoc);
                document.body.style.cursor = 'auto';
            },
            (err) => {
                alert(err);
                document.body.style.cursor = 'auto';
            }
        );
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
    saveToClipboard(editor.getText());
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

function saveToClipboard(text: string): void {
    navigator.clipboard
        .writeText(text)
        .then(() => {
            console.log('Text copied to clipboard');
        })
        .catch((err) => {
            console.error('Error copying text: ', err);
        });
}

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

            const tagsDiv = document.createElement('div');
            tagsDiv.classList.add('history-tags');
            item.tags = [];

            // Input field for new text, hidden until
            // add button pressed
            const tagInput = document.createElement('input');
            const tagAddButton = document.createElement('button'); // add tag button
            tagInput.classList.add('history-item-tag-input-hidden');
            tagInput.classList.add('add-tag-input');
            // tagInput.autofocus = true;
            // tagInput.style.display = 'none';
            tagInput.addEventListener('keydown', (event) => {
                if (event.key == 'Enter') {
                    // TODO check for duplicate or empty string
                    const newTagText = tagInput.value;
                    tagInput.value = '';
                    // tagInput.style.display = 'none';
                    tagAddButton.style.display = 'inline-block';
                    tagInput.classList.remove('history-item-tag-input-visible');
                    tagInput.classList.add('history-item-tag-input-hidden');

                    item.tags.push(newTagText);
                    // TODO update clip to main

                    // create new tag button
                    const tagButton = document.createElement('button');
                    tagButton.classList.add('history-item-tag-button');
                    tagButton.classList.add('tag-button');
                    tagButton.textContent = newTagText;

                    tagsDiv.appendChild(tagButton);
                    // alert(`add tag ${newTagText}`);
                }
            });
            tagsDiv.appendChild(tagInput);

            // add button
            tagAddButton.classList.add('history-item-tag-button');
            tagAddButton.classList.add('add-tag-button');
            tagAddButton.textContent = '+';
            tagAddButton.addEventListener('click', () => {
                tagInput.classList.remove('history-item-tag-input-hidden');
                tagInput.classList.add('history-item-tag-input-visible');
                // tagInput.style.display = 'inline-block';
                // tagInput.style.width = '200px';
                tagAddButton.style.display = 'none';
                tagInput.focus();
            });
            tagsDiv.appendChild(tagAddButton);

            item.tags.forEach((tag) => {
                const tagButton = document.createElement('button');
                tagButton.classList.add('history-item-tag-button');
                tagButton.classList.add('tag-button');
                tagButton.textContent = tag;

                tagsDiv.appendChild(tagButton);
            });
            // tagsDiv.textContent = 'hi'; //item.tags;
            // tagsDiv.

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
                saveToClipboard(item.data);
            });
            const addButton = document.createElement('button');
            addButton.classList.add('history-item-button');
            addButton.classList.add('add-button');
            addButton.textContent = '+';
            addButton.addEventListener('click', () => {
                // TODO: Reset the editor undo history:

                currentClip = item;
                editor.appendText(item.data);
            });

            buttonDiv.appendChild(copyButton);
            buttonDiv.appendChild(addButton);

            contentDiv.appendChild(textDiv);
            contentDiv.appendChild(tagsDiv);
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

    editor.enableLineNumbers(CONFIG.lineNumbers);
    editor.enableLineWrap(CONFIG.lineWrap);
    editor.enableHighlightWhitespace(CONFIG.highlightWhitespace);
});

const targetElement = document.querySelector('#editor') as HTMLElement;
const editor = new Editor(targetElement);
