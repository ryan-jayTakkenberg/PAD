/**
 * Test for oba api
 * @author Armando Labega
 */
describe('Search a book', () => {
    const endpoint = "/oba";
    // run before each test
    beforeEach(() => {
        // go to this specific url
        cy.visit('http://localhost:8080')
    })

    // Test: validate chat view
    it('should check if it exist', function () {
        //Find the field for the user input, check if it exists.
        cy.get("#user-input").should("exist");

        //Find the field for the message box, check if it exists.
        cy.get(".message-box").should("exist");
    });

    //Test: successful in getting the keyword
    it('should have detected the correct keyword', () => {
        // start a fake server
        cy.server()

        const mockedResponse = {"keyword": "Harry Potter"};

        cy.intercept('POST', endpoint, {
            statusCode: 200,
            body: mockedResponse,
        }).as('oba');

        cy.get("#user-input").type("mag ik een boek over harry potter").type('{enter}');

        cy.get('.message-box').should('not.be.empty');

        cy.wait("@oba", {timeout: 20000});

        cy.get("@oba").should((xhr) => {
            //The keyword should match what we typed earlier
            const body = xhr.request.body;
            expect(body.keyword).equals("Harry Potter");
        });
    });

    // Test: failed search in oba api
    it("should not find a result for the query", () => {
        //Start a fake server
        cy.server();

        const mockedResponse = {"keyword": "Harry Potter"};

        //Add a stub with the URL /oba as a POST
        //Respond with a JSON-object when requested and set the status-code tot 401.
        //Give the stub the alias: @oba
        cy.intercept('POST', endpoint, {
            statusCode: 200,
            body: mockedResponse,
        }).as('oba');

        cy.get("#user-input").type("mag ik een boek over harry potter").type('{enter}');

        //Wait for the @oba-stub to be called by the click-event.
        cy.wait("@oba", {timeout: 20000});

        //After a failed search, an element containing our error-message should be shown.
        cy.get(".error").should("exist").should("contain", "Geen resultaten gevonden voor uw zoekopdracht. " +
            "Uw boek bestaat niet of u heeft een typfout gemaakt!");
    });
});