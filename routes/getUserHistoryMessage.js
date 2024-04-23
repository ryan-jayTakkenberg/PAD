/**
 * route for the answers from de database
 * @author Ryan Takkenberg
 */
class getUserHistoryMessage {
    #app;
    #errorCodes = require("../framework/utils/httpErrorCodes")

    constructor(app) {
        this.#app = app;
        this.databaseHelper = require("../framework/utils/databaseHelper");
        this.getUserMessage();
    }

    /**
     * @author Ryan Takkenberg & Yusuf Çalik
     */
    getUserMessage() {
        this.#app.post("/getUserHistoryMessage", async (request, result) => {
            const question = request.body.question;
            const userId = request.body.userId;
            try {
                const results = await this.databaseHelper.handleQuery({
                    query: "SELECT answer FROM userquestion WHERE question = ? AND userId = ?",
                    values: [question, userId],
                });
                if (results.length > 0) {
                    result.json({ results });
                } else {
                    result.json({ results: null });
                }
            } catch (error) {
                console.log(error);
                const errorMessage = "Het is niet gelukt om antwoord uit uw geschiedenis te halen. Meld dit bij een medewerker.";
                result.status(this.#errorCodes.BAD_REQUEST_CODE).json({ error: errorMessage });
            }
        });
    }


}

module.exports = getUserHistoryMessage;
