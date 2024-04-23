/**
 * route for OBA API
 * @author Armando Labega
 */

const jwt = require('jsonwebtoken');
const https = require('https');

class ObaApiRoute {
    #app;
    #httpsErrorCodes = require("../framework/utils/httpErrorCodes.js");

    constructor(app) {
        this.#app = app;
        this.#getApi();
    }

    /**
     * Creates a JSON Web Token (JWT) and returns it.
     * @returns {*} The generated JWT
     * @private
     * @author Armando Labega
     */
    #createJsWebToken() {
        const secretKey = '4289fec4e962a33118340c888699438d';
        const publicKey = '1e19898c87464e239192c8bfe422f280';
        const date = Math.floor(Date.now() / 1000) + (30 * 60);
        const payload = {
            "key": publicKey,
            "exp": date,
            "description": "HvA_student"
        }
        return jwt.sign(payload, secretKey);
    }

    /**
     * Sets up the API endpoint for handling the "/oba" route.
     * When a POST request is received, it retrieves search results from the OBA API and sends the response.
     * @private
     * @author Armando Labega
     */
    #getApi() {
        this.#app.post("/oba", async (req, res) => {
            // token for authentication to use the url
            const jwToken = this.#createJsWebToken();
            const keyword = req.body.keyword;

            try {
                // perform a search request with the specific keyword
                const request = https.get(`https://zoeken.oba.nl/api/v1/search/?q=${keyword}`, {
                    headers: {
                        contentType: "application/json",
                        authorization: `Bearer ${jwToken}`
                    },
                }, (obaResponse) => {
                    let bodyChunks = [];
                    // receive data chunks from the response
                    obaResponse.on('data', (chunk) => {
                        bodyChunks.push(chunk);
                    }).on("end", () => {
                        // concatenate the received chunks into a single string
                        let obaResponseJson = Buffer.concat(bodyChunks).toString("utf-8");
                        // remove any carriage return and newline characters from the string
                        obaResponseJson = obaResponseJson.replaceAll('\r\n', '');
                        // send the response JSON to the client
                        res.status(this.#httpsErrorCodes.HTTP_OK_CODE).json(obaResponseJson);
                    })
                });
            } catch (e) {
                // handle any errors that occurred during the request
                console.error(e);
                // send an error response to the client
                res.status(this.#httpsErrorCodes.BAD_REQUEST_CODE).json({ error: 'Internal server error' });
            }
        })
    }
}

module.exports = ObaApiRoute;