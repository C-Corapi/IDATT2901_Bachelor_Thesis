/// <reference types="cypress" />
 
import 'cypress-plugin-tab';

Cypress.Commands.add('visitAndWait', (url: string) => {
  cy.visit(url);
  cy.get('h1').should('be.visible');
});

declare global {
  namespace Cypress {
    interface Chainable {
      visitAndWait(url: string): Chainable<void>;
      tab(): Chainable<JQuery>;
    }
  }
}

export {};