/**
 * Cypress-test om te zien of chat-gpt werkt op de front end
 * @author Yusuf Çalik
 */


describe("Chat functionality", () => {
    // Define endpoints
    const endpoints = {
        helpQuestions: "/helpQuestion",
        userHistoryMessage: "/getUserHistoryMessage",
        commonQuestions: "/commonQuestions",
        chatGPT: "/question",
        keyword: "/chatKeyword",
        oba: "/oba",
    };

    beforeEach(() => {
        // Set up server and visit the page before each test
        cy.visit("http://localhost:8080");
        cy.server();
    });

    // Helper function to intercept requests and provide mocked responses
    const interceptAndReply = (method, endpoint, response) => {
        cy.intercept(method, endpoint, (req) => {
            req.reply(response);
        }).as(endpoint);
    };

    // Test: Validate field existence
    it("Type fields", () => {
        cy.get("#user-input").should("exist"); // Check if the user input field exists
        cy.get(".message-box").should("exist"); // Check if the message box exists
        cy.get("#submit-button").should("exist"); // Check if the submit button exists
    });

    // Test: Successful message flow
    it("Successful message", () => {
        const mockedResponse = { results: null };
        const chatGPTResponse = { output: "Hallo! Hoe kan ik je vandaag helpen." };

        // Intercept GET and POST requests for all endpoints and provide mocked responses
        Object.values(endpoints).forEach((endpoint) => {
            interceptAndReply("GET", endpoint, mockedResponse);
            interceptAndReply("POST", endpoint, mockedResponse);
        });

        interceptAndReply("POST", endpoints.chatGPT, chatGPTResponse); // Intercept chatGPT endpoint with the chatGPTResponse

        cy.get("#user-input").type("Hallo"); // Type "Hallo" in the user input field
        cy.get("#submit-button").click(); // Click the submit button

        // Wait for all intercepted requests to complete
        Object.values(endpoints).forEach((endpoint) => {
            cy.wait(`@${endpoint}`);
        });

        cy.wait(2000); // Wait for 2 seconds

        // Check if the bot message with the expected response exists
        cy.get(".bot-message").should("exist").contains(chatGPTResponse.output);
    });

    // Test: Failed message flow
    it("Failed message", () => {
        const mockedResponse = { results: null };
        const chatGPTErrorResponse = {
            statusCode: 500,
            output: "Oops! OBI heeft technische problemen! Meld dit bij een medewerker.",
        };

        // Intercept GET and POST requests for all endpoints and provide mocked responses
        Object.values(endpoints).forEach((endpoint) => {
            interceptAndReply("GET", endpoint, mockedResponse);
            interceptAndReply("POST", endpoint, mockedResponse);
        });

        interceptAndReply("POST", endpoints.chatGPT, chatGPTErrorResponse); // Intercept chatGPT endpoint with the chatGPTErrorResponse

        cy.get("#user-input").type("Hallo"); // Type "Hallo" in the user input field
        cy.get("#submit-button").click(); // Click the submit button

        // Wait for all intercepted requests to complete
        Object.values(endpoints).forEach((endpoint) => {
            cy.wait(`@${endpoint}`);
        });

        // Check if the bot message with the expected error response exists
        cy.get(".bot-message")
            .should("exist")
            .contains(chatGPTErrorResponse.output);
    });
});
