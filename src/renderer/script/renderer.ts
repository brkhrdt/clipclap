import { Clip } from '../../clip';

import '../css/style.css';

// Globals
let currentClip: Clip | null = null; // clip being edited

// Set up the search input listener
const searchInput = document.getElementById('searchInput') as HTMLInputElement;
const promptInput = document.getElementById('promptInput') as HTMLInputElement;

// Listen for changes in the search input field
searchInput.addEventListener('input', async () => {
    const query = searchInput.value;
    const newHistory = await window.electron.filterHistory(query);  // Update search results based on input value
    console.log('new hist', newHistory);
    updateHistory(newHistory);
});

// Listen for changes in the prompt input field
promptInput.addEventListener('keyup', async ({key}) => {
    if (key === 'Enter') {
        const prompt = promptInput.value;
        const newDoc = await window.electron.promptLLM(prompt, editor.state.doc.toString());
        console.log('new doc from llm', newDoc);
        editor.dispatch({changes: {
            from: 0,
            to: editor.state.doc.length,
            insert: newDoc
        }});
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

function updateHistory(history: Clip[]): void {
    const historyElement = document.getElementById('history');
    
    if (historyElement) {
        historyElement.innerHTML = '';

        history.forEach((item: Clip) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('history-item');
            
            const textDiv = document.createElement('div');
            textDiv.classList.add('history-text');
            textDiv.textContent = item.data;

            const dateDiv = document.createElement('div');
            dateDiv.classList.add('history-date');
            dateDiv.textContent = item.date.toLocaleString();

            const buttonDiv = document.createElement('div');
            buttonDiv.classList.add('button-container');
            
            const copyButton = document.createElement('button');
            copyButton.classList.add('copy-button');
            copyButton.textContent = 'Copy';
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(item.data)
                    .then(() => {
                        console.log('Text copied to clipboard');
                    })
                    .catch((err) => {
                        console.error('Error copying text: ', err);
                    });
            });
            const editButton = document.createElement('button');
            editButton.classList.add('edit-button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => {
                // TODO: Reset the editor undo history:
                
                currentClip = item;
                editor.dispatch({changes: {
                    from: 0,
                    to: editor.state.doc.length,
                    insert: item.data
                }});
            });

            buttonDiv.appendChild(copyButton);
            buttonDiv.appendChild(editButton);

            itemDiv.appendChild(textDiv);
            itemDiv.appendChild(dateDiv);
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


import { basicSetup, EditorView } from 'codemirror'

const initialText = 'console.log("hello, world")'
const targetElement = document.querySelector('#editor')!

let editor = new EditorView({
  doc: initialText,
  extensions: [
    basicSetup,
  ],
  parent: targetElement,
})

