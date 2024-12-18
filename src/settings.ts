import { z } from 'zod';
import { PathLike, readFileSync } from 'fs';

const configuration = z.object({
    /* Window */
    // last position?
    theme: z.enum(['system', 'light', 'dark']).default('system'),

    /* Clipboard */
    maxClipboardHistory: z.number().default(100),
    clipboardPollRate: z.number().default(1000),

    /* Editor */
    lineWrap: z.boolean().default(true),
    lineNumbers: z.boolean().default(false),
    highlightWhitespace: z.boolean().default(false),

    /* Models */
    // TODO list of model schema
    name: z.string().default('displayname'),
    model: z.string().default('modelname'),
    apiUrl: z.string().default('apiurl'),
    apiKey: z.string().default('apikey'),
    systemPrompt: z.string().default('systemprompt'),
});

type Configuration = z.infer<typeof configuration>;

function readConfig(filePath: PathLike | null): Configuration {
    let configData: Configuration;

    if (filePath === null) {
        return configuration.parse({});
    }

    try {
        const rawData = readFileSync(filePath, 'utf-8');
        configData = JSON.parse(rawData);
        const config = configuration.parse(configData);
        console.log('Data is valid');
        return config;
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.log('Validation failed:', error.errors);
        } else {
            console.error('Error reading or parsing the file:', error);
        }
    }
}

export { readConfig, Configuration };
