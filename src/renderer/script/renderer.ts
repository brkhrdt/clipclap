import { Clip } from '../../clip';

import '../css/style.css';


// Set up the search input listener
const searchInput = document.getElementById('searchInput') as HTMLInputElement;

// Listen for changes in the search input field
searchInput.addEventListener('input', async () => {
    const query = searchInput.value;
    const newHistory = await window.electron.filterHistory(query);  // Update search results based on input value
    console.log('new hist', newHistory);
    updateHistory(newHistory);
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

            itemDiv.appendChild(textDiv);
            itemDiv.appendChild(dateDiv);
            itemDiv.appendChild(copyButton);

            historyElement.appendChild(itemDiv);
        });
    } else {
        console.error("Element with id 'history' not found.");
    }
}

window.electron.onClipboardUpdated((event: Event, history: Clip[]) => {
    updateHistory(history);
});
