/**
 * route voor de question and answers
 * @author Ryan Takkenberg
 */

import {NetworkManager} from "../framework/utils/networkManager.js";

export class concertRepository {
    #networkManager;
    #route;

    constructor() {
        this.#route = "/concert";
        this.#networkManager = new NetworkManager();
    }

    async selectQuestion(question, answer) {
        return await this.#networkManager.doRequest(`${this.#route}`, "GET", {question: question, answer: answer});

    }
}