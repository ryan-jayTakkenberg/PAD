/**
 * route for the question and answers
 * @author Ryan Takkenberg
 */
class historieRoute {
    #app;
    #errorCodes = require("../framework/utils/httpErrorCodes")

    constructor(app) {
        this.#app = app;
        this.databaseHelper = require("../framework/utils/databaseHelper");
        this.setupRoutes();
    }

    setupRoutes() {
        this.#app.post("/historieRoute", async (req, res) => {
            try {
                // Retrieve questions from the userquestion table for the given userId
                const resultsquetions = await this.databaseHelper.handleQuery({
                    query: "SELECT question FROM userquestion WHERE userID = ?",
                    values: [req.body.userId],
                });

                // Map the results to extract the question field and create an array of questions
                const questions = resultsquetions.map((row) => ({ question: row.question }));
                res.json(questions);

                // Extract the new question and answer from the request body
                const newQuestion = req.body.question.substring(0, 1000);
                const newAnswer = req.body.answer.substring(0, 1000);
                let isDuplicate = false;

                // Check if the new question already exists in the userquestion table
                for (let i = 0; i < resultsquetions.length; i++) {
                    if (resultsquetions[i].question === newQuestion) {
                        isDuplicate = true;
                        break;
                    }
                }

                if (isDuplicate) {
                    // If the question is a duplicate, send a "Duplicate entry" error response

                    console.log("De vraag is een duplicaat.");
                    res.status(this.#errorCodes.BAD_REQUEST_CODE).end();

                } else {
                    // Insert the new question and answer into the userquestion table
                    const results = await this.databaseHelper.handleQuery({
                        query: "INSERT INTO userquestion (question, answer, userId) VALUES (?,?,?)",
                        values: [newQuestion, newAnswer, req.body.userId],

                    });

                    const id = results.insertId;

                    // Send a response with the inserted question and answer details
                    res.json({ id: id, question: newQuestion, answer: newAnswer });
                }
            } catch (e) {
                // If an error occurs, log the error and send a "Bad Request" response
                res.status(this.#errorCodes.BAD_REQUEST_CODE).end();
            }
        });
    }
}

module.exports = historieRoute;



