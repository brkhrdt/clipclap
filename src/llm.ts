import OpenAI from 'openai';
import logger from './logger'; // Import the logger

class LLM {
    private openai: OpenAI;
    private systemPrompt: string;

    constructor(baseURL: string, apiKey: string, systemPrompt: string) {
        this.openai = new OpenAI({ baseURL, apiKey });
        this.systemPrompt = systemPrompt;
    }

    public async runLLM(userPrompt: string): Promise<string> {
        logger.debug(`Running LLM prompt: ${userPrompt}`);
        const completion = await this.openai.chat.completions.create({
            model: 'gemma2:27b',
            messages: [
                {
                    role: 'system',
                    content: this.systemPrompt,
                },
                {
                    role: 'user',
                    content: userPrompt,
                },
            ],
        });

        console.log(completion.choices[0].message.content);
        return completion.choices[0].message.content;
    }

    public updateSystemPrompt(newText: string) {
        this.systemPrompt = newText;
    }
}

export default LLM;
