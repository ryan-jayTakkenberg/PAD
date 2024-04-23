/**
 * Repository for example questions in the database
 * @author Armando Labega
 */
import {NetworkManager} from "../framework/utils/networkManager.js";

export class HelpQuestionsRepository {
    #networkManager;
    #route;

    constructor() {
        this.#route = "/helpQuestion";
        this.#networkManager = new NetworkManager();
    }

    async selectQuestion() {
        return await this.#networkManager.doRequest(`${this.#route}`, "GET");
    }
}