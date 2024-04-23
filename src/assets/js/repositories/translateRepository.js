/**
 * Sends untranslated and selected language text to translate api
 * @author Armando Labega
 */
import {NetworkManager} from "../framework/utils/networkManager.js";

export class TranslateRepository {
    #route;
    #networkManager;

    constructor() {
        this.#route = "/translate";
        this.#networkManager = new NetworkManager();
    }

    /**
     * Sends Post request to translate api with the untranslated text and the selected language
     * @author Armando Labega
     * @param unTranslatedText
     * @param selectedLanguage
     * @returns {Promise<*>}
     */
    async translating(unTranslatedText, selectedLanguage) {
        return await this.#networkManager.doRequest(`${this.#route}`, "POST",
            {"untranslatedText":unTranslatedText,"selectedLanguage":selectedLanguage});
    }
}