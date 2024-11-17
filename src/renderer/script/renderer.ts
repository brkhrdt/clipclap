import { Clip } from '../../clip';

import '../css/style.css';

window.electron.onClipboardUpdated((event: Event, history: Clip[]) => {

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
});
