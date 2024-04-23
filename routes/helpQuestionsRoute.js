/**
 * Routes file for getting the help questions in the database
 * @author Armando Labega
 */

class HelpQuestionsRoute {
    #app;
    #databaseHelper = require("../framework/utils/databaseHelper.js");
    #httpsErrorCodes = require("../framework/utils/httpErrorCodes.js");

    constructor(app) {
        this.#app = app;
        this.#selectExampleQuestion();
    }

    /**
     * This function makes a GET request to fetch data from the helpquestions table in the database and returns the data.
     * @author Armando Labega
     * @private
     */
    #selectExampleQuestion() {
        this.#app.get("/helpQuestion", async (req, res) => {
            try {
                // Retrieve data from the helpquestions table using the databaseHelper
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT question, answer FROM helpquestions",
                });
                // Send the retrieved data as a JSON response
                res.json(data);
            } catch (e) {
                console.error(e);
                // Handle errors and send an appropriate error response
                res.status(this.#httpsErrorCodes.BAD_REQUEST_CODE).json({
                    error: 'Something went wrong with getting the question information. Refresh the page and try again.'
                });
            }
        });
    }
}

module.exports = HelpQuestionsRoute;