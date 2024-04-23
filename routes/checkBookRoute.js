/**
 * this route checks if there is a keyword and if there is, it returns it
 * @author Armando Labega
 */
const {OpenAIApi, Configuration} = require("openai");

class KeywordCheckRoute {
    #app;

    constructor(app) {
        this.#app = app;
        this.#getKeyword();
    }

    /**
     * this function sends a post request to chatgpt api and asks if it detects a book title or subject, then returns
     * the booktitle or subject.
     * @author Armando Labega
     * @private
     */
    #getKeyword() {
        const config = {
            apiKey: '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'
        };

        const openai = new OpenAIApi(new Configuration(config));

        try {
            this.#app.post("/chatKeyword", async (req, res) => {
                const question = req.body['question'];

                // Send the question to the OpenAI API and ask it to identify the book title or subject
                const response = await openai.createChatCompletion({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",

                            content: "You are a helpful assistant. The user said: '" + question +
                                "'. Detect if the user asks something about a book title or a specific subject for a book." +
                                " Extract the book title or the subject and only return the book title or subject."
                        },
                        {
                            role: "user",
                            content: question
                        }
                    ],
                    temperature: 0.1, // Makes the outputs less randomly generated
                });

                // Extract the book title from the assistant's response
                const messageContent = response.data.choices[0].message.content;

                // // regex to extract the book title from the assistant's response
                const match = messageContent.match(/"([^"]+)"/);
                // If a match is found, use it as the book title, else return an empty string
                const bookTitle = match ? match[1] : '';

                res.send({
                    keyword: bookTitle
                })
            });
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = KeywordCheckRoute;