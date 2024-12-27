import Fuse, { IFuseOptions, FuseResult } from 'fuse.js';

import { Clip } from './clip';
import logger from './logger'; // Import the logger

const options: IFuseOptions<Clip> = {
    keys: ['data', 'tags'],
    useExtendedSearch: true,
};

// Function to update the search results
async function filterHistory(query: string, history: Clip[]): Promise<Clip[]> {
    if (query === '') {
        return history;
    }
    // Create a Fuse instance (can be reinitialized when items change)
    let fuse = new Fuse(history, options);

    // Perform the search using Fuse.js
    const results = fuse.search(query);

    // Process results here (e.g., update the DOM or data binding)
    logger.debug(`Search Results: ${JSON.stringify(results)}`); // For example, logging results to the console

    const clips = results.map((x) => x.item);

    return clips;
}

export { filterHistory };
