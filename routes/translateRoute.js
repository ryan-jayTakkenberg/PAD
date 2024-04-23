/**
 * This route makes connection with the google cloud translate api
 * @author Armando Labega
 */

const {Translate} = require('@google-cloud/translate').v2;
require('dotenv').config();

// Parsing the credentials from environment variables
const CREDENTIALS = JSON.parse(process.env.CRENDENTIALS);

// Creating a Translate instance with the parsed credentials
const translate = new Translate({
    credentials: CREDENTIALS,
    projectId: CREDENTIALS.project_id
});

class TranslateRoute {
    #app;
    #httpsErrorCodes = require("../framework/utils/httpErrorCodes.js");

    constructor(app) {
        this.#app = app;
        this.#translateText();
    }

    /**
     * This function makes a POST request to the Translate API and retrieves a translated sentence.
     * @author Armando Labega
     * @private
     */
    #translateText() {
        this.#app.post("/translate", async (req, res) => {
            const untranslatedText = req.body.untranslatedText;
            const selectedLanguage = req.body.selectedLanguage;

            try {
                // Performing translation using the Translate API
                let [translations] = await translate.translate(untranslatedText, selectedLanguage);
                translations = Array.isArray(translations) ? translations : [translations];

                console.log('Translations:');
                translations.forEach((translation, i) => {
                    console.log(`${untranslatedText[i]} => (${selectedLanguage}) ${translation}`);
                });

                // Sending the translated output as a response
                res.send({
                    output: translations
                });
            } catch (e) {
                console.error(e)
                // Handling errors and sending an appropriate error response
                res.status(this.#httpsErrorCodes.BAD_REQUEST_CODE).json({
                    error: 'Something went wrong with the translation. Refresh the page and try again.'
                });
            }
        });
    }
}

module.exports = TranslateRoute;