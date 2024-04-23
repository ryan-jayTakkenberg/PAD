/**
 * route for deleting the historie
 * @author Ryan Takkenberg
 */

class deleteHistorie {
    #app;
    #errorCodes = require("../framework/utils/httpErrorCodes")
    constructor(app) {
        this.#app = app;
        this.databaseHelper = require("../framework/utils/databaseHelper");
        this.setupRoutes();
    }

    setupRoutes() {
        this.#app.post("/deleteHistorie", async (req, res) => {

            try {
                const results = await this.databaseHelper.handleQuery({
                    query: "SELECT id FROM userquestion WHERE question = ?",
                    values: [req.body.question]
                });
                const questionId = results[0].id;

                await this.databaseHelper.handleQuery({
                    query: "DELETE FROM userquestion WHERE id = ?",
                    values: [questionId]
                });
                res.json("Question deleted successfully.");
            } catch (e) {
                console.log(e);
                res.status(this.#errorCodes.BAD_REQUEST_CODE).end();
            }
        });
    }
}

module.exports = deleteHistorie;
