/// <reference types="Cypress" />

describe("Users Login", () => {
  const username = Cypress.config("username");
  const password = Cypress.config("password");

  it("visits login page and tries to log in with the wrong password", () => {
    cy.wait(5000);

    cy.visit("/");

    cy.url().should("include", "/datasets");

    cy.wait(5000);

    cy.get("[data-cy=login-button]").click();

    cy.wait(5000);

    cy.url().should("include", "/login");

    cy.get("#usernameInput")
      .type(username)
      .should("have.value", username);

    cy.get("#passwordInput")
      .type("invalid")
      .should("have.value", "invalid");

    cy.get("button[type=submit]").click();

    cy.contains("Could not log in. Check your username and password.");
  });

  it("visits login page and logs in with a functional account", () => {
    cy.wait(5000);

    cy.visit("/");

    cy.url().should("include", "/datasets");

    cy.wait(5000);

    cy.get("[data-cy=login-button]").click();

    cy.wait(5000);

    cy.url().should("include", "/login");

    cy.get("#usernameInput")
      .type(username)
      .should("have.value", username);

    cy.get("#passwordInput")
      .type(password)
      .should("have.value", password);

    cy.contains("Remember me").click();

    cy.get("button[type=submit]").click();

    cy.url().should("include", "/datasets");

    cy.get(".user-button").should("contain.text", username);
  });
});
