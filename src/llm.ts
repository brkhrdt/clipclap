import OpenAI from 'openai'

async function run_llm() {
    const openai = new OpenAI({
        baseURL: 'http://localhost:11434/v1',
        apiKey: 'ollama', // required but unused
    });
    // const listCompletion = await openai.models.list();
    // console.log(listCompletion);

    // const completion = await openai.chat.completions.create({
    //     model: 'gemma2:27b',
    //     messages: [{ role: 'user', content: 'Why is the sky blue?' }],
    // })
    const completion = await openai.chat.completions.create({
        model: 'gemma2:27b',
        messages: [
            {
                role: 'system',
                content: 'You are an expert assistant and will be given some text to modify based on the user\'s request. Only modify the given text. Be concise and do not give any information that is no asked for.\n\nHere is the text:\ncd ~/work\nrunJob ./config.xml'
            }
            {
                role: 'user',
                content: 'generalize the directory and file these commands to share with other user'
            }
        ],
    });

    console.log(completion.choices[0].message.content);
}



export { run_llm };
