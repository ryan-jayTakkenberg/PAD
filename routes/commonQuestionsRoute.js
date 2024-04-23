/**
 * route for the answers from de database
 * @author Yusuf Çalik
 */
class getUserHistoryMessage {
    #app;
    #errorCodes = require("../framework/utils/httpErrorCodes")

    constructor(app) {
        this.#app = app;
        this.databaseHelper = require("../framework/utils/databaseHelper");
        this.commonQuestions();
    }

    /**
     * @author Yusuf Çalik
     */
    commonQuestions() {
        this.#app.post("/commonQuestions", async (request, result) => {
            const question = request.body.question;
            try {
                const results = await this.databaseHelper.handleQuery({
                    query: "SELECT answer FROM dataset WHERE question = ?",
                    values: [question],
                });
                if (results.length > 0) {
                    result.json({ results });
                } else {
                    result.json({ results: null });
                }
            } catch (error) {
                console.log(error);
                const errorMessage = "Oei! OBI heeft problemen met zijn netwerk. Meld dit bij een werknemer.";
                result.status(this.#errorCodes.BAD_REQUEST_CODE).json({ error: errorMessage });            }
        });
    }
}

module.exports = getUserHistoryMessage;
