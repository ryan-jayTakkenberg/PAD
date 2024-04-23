/**
 * @author Yusuf Çalik
 * Deze Cypress test, test of er een bericht kan worden verzonden,
 * of het aankomt bij de endpoint, en of ik een bericht terug krijg van de endpoint.
 */


describe("Chat functionality", () => {
    const endpoint = "/commonQuestions";

    // Run before each test in this context
    beforeEach(() => {
        // Go to the specified URL
        cy.visit("http://localhost:8080");
    });

    // Test: Validate field
    it("Type fields", () => {
        // Find the field for the message, check if it exists.
        cy.get("#user-input").should("exist");

        // Find the field for the message, check if it exists.
        cy.get(".message-box").should("exist");

        // Find the button to submit, check if it exists.
        cy.get("#submit-button").should("exist");
    });

    // Test: Successful message back
    it("Successful message", () => {
        // Start a fake server
        cy.server();

        // Find the field for the username and type the text "test".
        cy.get("#user-input").type("dataset");

        // Find the button to login and click it
        cy.get("#submit-button").click();

        // Intercept the POST request to the specified endpoint
        cy.intercept("POST", endpoint).as("commonQuestionRoute");

        // Wait for the intercepted request to complete, with a timeout of 8000ms
        cy.wait("@commonQuestionRoute", {timeout: 2000}).then(() => {

            // Wait until the bot message appears
            cy.get(".bot-message").should("exist");
            // Check that the "OBI" text is present in the bot message
            cy.get(".bot-message").should("contain", "werkt");
        });
    });

    // Test: Error response
    it("Error database response", () => {
        // Start a fake server
        cy.server();

        const mockedResponse = {
            result: "Oops! OBI heeft technische problemen! Meld dit bij een medewerker."
        };

        // Intercept the POST request to the specified endpoint and return an error response
        cy.intercept("POST", endpoint, {
            statusCode: 200,
            body: mockedResponse
        }).as("error");

        // Find the field for the username and type the text "error".
        cy.get("#user-input").type("error");

        // Find the button to login and click it
        cy.get("#submit-button").click();

        // Wait for the intercepted request to complete, with a timeout of 2000ms
        cy.wait("@error", { timeout: 2000 });

        // Check that the error message is displayed
        cy.get(".bot-message").should("exist");
        cy.get(".bot-message").should("contain", "Oops");
    });

});
