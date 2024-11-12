describe("Proposals general", () => {
  beforeEach(() => {
    cy.login(Cypress.env("username"), Cypress.env("password"));
  });

  describe("Proposals Page Component", () => {
    let logbookLogs = [];
    const logBookAction =
      "Logbook reducer Action came in! [Logbook] Fetch Logbook Complete";

    beforeEach(() => {
      // Clear logs before each test
      logbookLogs = [];

      // Capture console logs matching logBookAction
      cy.window().then((win) => {
        cy.stub(win.console, "log").callsFake((...args) => {
          // Check if the first argument matches logBookAction
          if (args[0] === logBookAction) {
            logbookLogs.push(args[0]);
          }
          // Preserve the original console.log behavior
          return win.console.log.apply(win.console, args);
        });
      });
    });

    it("should trigger 'Fetch Logbook Complete' action only once after navigation", () => {
      const proposalId = Math.floor(100000 + Math.random() * 900000).toString();
      cy.createProposal(proposalId);
      cy.visit("/proposals");

      cy.contains("A minimal test proposal").click();
      cy.finishedLoading();
      cy.visit("/datasets");

      cy.wrap(null).should(() => {
        expect(logbookLogs).to.have.length(1);
      });

      cy.login(
        Cypress.env("secondaryUsername"),
        Cypress.env("secondaryPassword"),
      );
      cy.deleteProposal(proposalId);
    });
  });
});
