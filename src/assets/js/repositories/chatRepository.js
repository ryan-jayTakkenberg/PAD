/**
 * Repository responsible for all user data from server - CRUD
 * Make sure all functions are using the async keyword when interacting with network!
 *
 */

import { NetworkManager } from "../framework/utils/networkManager.js";


export class chatRepository {
    #chatgptAPI
    #networkManager
    #historieRoute;
    #Gethistorie
    #getUserHistoryMessage
    #deleteHistorie
    #commonQuestions



    /**
     * Initializes the endpoint for the chat controller
     */
    constructor() {
        // This is the endpoint used, it must match the endpoint in "chatGPTRoutes.js".
        // Remember that different endpoints cannot be the same as each other
        this.#chatgptAPI = "/question";
        this.#historieRoute = "/historieRoute"
        this.#networkManager = new NetworkManager();
        this.#Gethistorie = "/GetHistorie"
        this.#getUserHistoryMessage = "/getUserHistoryMessage";
        this.#deleteHistorie = "/deleteHistorie"
        this.#commonQuestions = "/commonQuestions"
    }

    /**
     * @auth Yusuf Çalik & Armando Labega
     * Sends a POST request to the server with the user's question
     * @param {string} question The user's question to be sent to the server
     * @returns {Promise} A promise that resolves to the server's response
     */
    async chatgptAPI(question) {
        // Sends a POST request with the user's question to the ChatGPT & OBA API route
        return await this.#networkManager.doRequest(`${this.#chatgptAPI}`, "POST", {
            "content": question
        });
    }

    /**
     *  repository for getting answer from database
     *  @author Yusuf Çalik
     */
    async commonQuestions(question) {
        // Sends a POST request with the user's question to the commonQuestions route
        return await this.#networkManager.doRequest(`${this.#commonQuestions}`, "POST",{
            "question": question
        });
    }

    /**
     *  repository for getting answer from database
     *  @author Ryan-Jay Takkenberg & Yusuf Çalik
     */
    async getUserHistoryMessage(question, userId) {
        // Sends a POST request with the user's question and userID to the getUserHistoryMessage route
        return await this.#networkManager.doRequest(`${this.#getUserHistoryMessage}`, "POST",{
            "question": question,
            "userId": userId
        });
    }

    /**
     *  repository for storing the question and answer
     *  @author Ryan-Jay Takkenberg & Yusuf Çalik
     */

    async postQuestion(question, answer, userId) {

        return await this.#networkManager.doRequest(`${this.#historieRoute}`, "POST", {
            "question": question,
            "answer": answer,
            "userId": userId
        });
    }

    /**
     *  repository getting the questions
     *  @author Ryan-Jay Takkenberg
     */

    async getQuestion(userId) {

        return await this.#networkManager.doRequest(`${this.#Gethistorie}/${userId}`, 'GET');

    }

    /**
     *  repository deleting the questions
     *  @author Ryan-Jay Takkenberg
     */
    async deleteHistorie(question) {

        return await this.#networkManager.doRequest(`${this.#deleteHistorie}`, "POST", {
            "question": question
        });
    }

}