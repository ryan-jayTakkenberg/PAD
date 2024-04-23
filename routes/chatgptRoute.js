/**
 * @author Yusuf Çalik
 * #chat
 * @see https://platform.openai.com/docs/guides/chat/introduction
 * Sends a user's question to OpenAI and returns the response from the "createChatCompletion" service.
 * @async
 * @param {string} question - The question from the user.
 * @returns {Promise<Object>} A Promise that resolves with the response object from the "createChatCompletion" service.
 * @throws {Error} If there is an error in the OpenAI API request or response.
 */
const {OpenAIApi, Configuration} = require("openai");

class ChatgptRoute {
    #app
    conversationHistory = [];

    /**
     * Constructor for ChatgptRoute class.
     * @param {Object} app - The express app object.
     */
    constructor(app) {
        this.#app = app;

        this.#chat();
        // OpenAI configuration using an API key
        const config = {
            apiKey: 'x'
        };
        // Instantiates OpenAI API object
        this.openai = new OpenAIApi(new Configuration(config));
    }

    /**
     * Listens at the endpoint "/chat" for POST requests and sends the user's question to OpenAI for a response.
     * @private
     */
    #chat() {
        // Handles POST requests to "/chat"
        this.#app.post("/question", async (request, result) => {
            // Gets the question from the user's request
            const question = request.body['content'];
            //send the user question to the conversation

            this.conversationHistory.push({
                role: "user",
                content: question
            });

            try {
                // Sends the question to OpenAI for a response using the "createChatCompletion" service
                const response = await this.openai.createChatCompletion({
                    // Uses the "gpt-3.5-turbo" model, currently the newest model
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "Jij bent een chat bot genaamd OBI van de OBA (Openbare Bibliotheek Amsterdam)."
                        },
                        // The spread syntax ... is used to concatenate the existing conversationHistory array with the new message object:
                        ...this.conversationHistory,
                        {
                            role: "user",
                            content: question
                        }
                    ],
                    // Controls the randomness of the generated text. Lower values produce more focused answers
                    temperature: 0.1,
                    // Specifies the maximum number of tokens in the response
                    max_tokens: 500
                });

                const answer = response.data.choices[0].message.content;

                //push answer to the conversation
                this.conversationHistory.push({
                    role: "assistant",
                    content: answer
                });

                //push answer to the front-end
                result.send({
                    output: answer
                });

            } catch (error) {
                //retrieves the HTTP status code from the error object's response
                const statusCode = error.response.status;

                if (statusCode === 503 || statusCode === 429) {

                    const errorMessage = "OBI is even koffie halen, probeer deze vraag later opnieuw te stellen.";
                    console.log("Het duurde te lang om een bericht op te halen van ChatGPT")

                    //Push error to the conversation
                    this.conversationHistory.push({
                        role: "assistant",
                        content: errorMessage
                    });

                    //Push error to the front-end
                    result.send({
                        output: errorMessage,
                    });
                } else if (statusCode === 500) {

                    const errorMessage = "OBI heeft momenteel technische problemen. Probeer later opnieuw.";
                    console.log("ChatGPT heeft serverproblemen")

                    //Push error to the conversation
                    this.conversationHistory.push({
                        role: "assistant",
                        content: errorMessage
                    });

                    //Push error to the front-end
                    result.send({
                        output: errorMessage,
                    });
                }
            }
        });
    }
}

module.exports = ChatgptRoute
