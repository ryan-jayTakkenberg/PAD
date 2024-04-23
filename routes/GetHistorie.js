
/**
 * route for the question and answers
 * @author Ryan Takkenberg
 */


class GetHistorie {

    #app;
    #errorCodes = require("../framework/utils/httpErrorCodes")
    constructor(app) {
        this.#app = app;
        this.databaseHelper = require("../framework/utils/databaseHelper");
        this.getQuestions();

    }


    getQuestions() {
        this.#app.get("/GetHistorie/:userId", async (req, res) => {
            // I pass the value with the parameter and this is where I retrieve it
            const userId = req.params.userId;

            try {
                // Haal de vragen op basis van de userId
                const results = await this.databaseHelper.handleQuery({
                    query: "SELECT question FROM userquestion WHERE userId = ?",
                    values: [userId],
                });
                console.log('results:', results);

                const questions = results.map((row) => ({ question: row.question }));
                res.json(questions);
            } catch (e) {
                console.log(e);
                res.status(this.#errorCodes.BAD_REQUEST_CODE).end();
            }
        });

    }
}

module.exports = GetHistorie;
