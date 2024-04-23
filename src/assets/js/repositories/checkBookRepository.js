/**
 * Sends the question to the checkBookRoute to check for a book title
 * @author Armando Labega
 */

import {NetworkManager} from "../framework/utils/networkManager.js";

export class KeywordCheckRepository {
    #route;
    #networkManager;

    constructor() {
        this.#route = "/chatKeyword";
        this.#networkManager = new NetworkManager();
    }

    /**
     * Sends post request to checkbookroute to check if the question contains a book title
     * @author Armando Labega
     * @param question
     * @returns {Promise<*>}
     */
    async getKeyword(question) {
        return await this.#networkManager.doRequest(`${this.#route}`, "POST", {"question": question});
    }
}