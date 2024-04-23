/**
 * repository for the OBA API route
 * @author Armando Labega
 */
import {NetworkManager} from "../framework/utils/networkManager.js";

export class ObaApiRepository {
    #route;
    #networkManager;

    constructor() {
        this.#route = "/oba";
        this.#networkManager = new NetworkManager();
    }

    /**
     * Sends a POST request to the "/oba" route and then returns the response of that POST request.
     * @param keyword - The keyword that the user inputted
     * @returns {Promise<*>}
     * @author Armando Labega
     */
    async searchOba(keyword) {
        return await this.#networkManager.doRequest(`${this.#route}`, "POST", {"keyword": keyword});
    }
}