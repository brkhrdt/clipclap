import { z } from 'zod';
import { PathLike, readFileSync } from 'fs';

//
// Keybinds
//
const keybind = z.object({
    key: z.string(),
    function: z.enum(['Show/hide']),
});
type Keybind = z.infer<typeof keybind>;

const defaultKeybinds: Keybind[] = [
    {
        key: 'CmdOrCtrl+Alt+V',
        function: 'Show/hide',
    },
];
const keybinds = z.array(keybind).default(defaultKeybinds);
type Keybinds = z.infer<typeof keybinds>;

//
// AI API
//
const llmAPI = z.object({
    baseurl: z.string(),
    apikey: z.string(),
    name: z.string(),
    systemprompt: z.string(),
});
type llmAPI = z.infer<typeof llmAPI>;

const modelAPIs = z.array(llmAPI).default([
    {
        baseurl: 'http://localhost:11434/v1',
        apikey: 'ollama',
        name: 'gemma2:27b',
        systemprompt: 'You are an expert assistant and will be given some text to modify based on the user\'s request. Only modify the given text. Be concise and do not give any information that is not asked for.\n\nHere is the text:\n<TEXT>',
    }
]);

const configuration = z.object({
    /* Window */
    // last position?
    theme: z.enum(['system', 'light', 'dark']).default('system'),

    keybinds: keybinds,

    models: modelAPIs,

    /* Clipboard */
    maxClipboardHistory: z.number().default(100),
    clipboardPollRate: z.number().default(1000),

    /* Editor */
    lineWrap: z.boolean().default(true),
    lineNumbers: z.boolean().default(true),
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

export { readConfig, Configuration, Keybinds, Keybind, llmAPI };
