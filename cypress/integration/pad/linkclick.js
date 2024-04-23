describe("Chat functionality", () => {
    const endpoint = "/users/chat";

    // Run before each test in this context
    beforeEach(() => {
        // Go to the specified URL
        cy.visit("http://localhost:8080");
    });

    // Test: Validate fields
    it("should display message input field, message box and submit button", () => {
        // Find and check if message input field exists
        cy.get("#user-input").should("exist");

        // Find and check if message box exists
        cy.get(".message-box").should("exist");

        // Find and check if submit button exists
        cy.get("#submit-button").should("exist");
    });

    // Test: Click on a clickable link in the chatbot response
    it("should be able to click a link in the chatbot response and go to the correct URL", () => {
        // Start a fake server
        cy.server();

        // Intercept the chat post request and set a route alias
        cy.route("POST", endpoint).as("chat");

        // Type user input
        const userInput = "Hoe kan ik mijn paspoort vernieuwen?";
        cy.get("#user-input").type(userInput);

        // Click submit button
        cy.get("#submit-button").click();

        // Wait for the chatbot response to load
        cy.wait("@chat");

        // Verify the chatbot response contains a clickable link
        cy.get(".message-box").contains("a", "https://www.amsterdam.nl/burgerzaken/paspoort-en-idkaart/paspoort-aanvragen/")
            .should("have.attr", "href", "https://www.amsterdam.nl/burgerzaken/paspoort-en-idkaart/paspoort-aanvragen/");

        // Click the link and verify it goes to the correct URL
        cy.get(".message-box a")
            .should("be.visible")
            .click()
            .debug();
        cy.url().should("equal", "https://www.amsterdam.nl/burgerzaken/paspoort-en-idkaart/paspoort-aanvragen/");
    });
});
