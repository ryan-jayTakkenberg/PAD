describe("Historie chat", () => {
    const endpoint = "/question";


    beforeEach(() => {
        cy.visit("http://localhost:8080");
    });

    it("should login and display chat messages and question", () => {
        cy.get('a[data-controller="login"]').click();

        // Type the username
        cy.get('input[name="username"]').type("ryan");

        // Type the password
        cy.get('input[type="password"]').type("ryan");

        // Click the login button
        cy.get('.btn-primary').click();

        // Intercept the POST request to the chat endpoint
        cy.intercept("POST", endpoint).as("ChatgptRoute");

        // Ensure the user input and message box elements exist
        cy.get("#user-input").should("exist");
        cy.get(".message-box").should("exist");

        // Send a message to the chat
        cy.get("#user-input").type("Hello");
        cy.get("#submit-button").click();

        // Wait for the API response
        cy.wait("@ChatgptRoute", { timeout: 8000 }).then(() => {
            // Ensure the message box still exists
            cy.get(".message-box").should("exist");

            // Click the delete button and confirm deletion
            cy.get(".delete-button").click();
            cy.get(".popup-button.confirm").click();

            // Reload the page
            cy.reload();

            // Wait for a brief moment to allow the page to reload
            cy.wait(1000);

            // Find the message element containing "Hello" text, get the parent element containing the message and delete button,
            // find the delete button within the parent element, and click it
            cy.get(".message")
                .contains("Hello")
                .should("exist")
                .parent()
                .find(".delete-historie")
                .click();

            cy.get(".message")
                .contains("hoi")
                .should("exist")

                .click();
        });
    });
});