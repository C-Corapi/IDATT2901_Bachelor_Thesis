describe('About Page', () => {
  beforeEach(() => {
    cy.visit('/about');
  });

  it('should display all metadata types information', () => {
    cy.get('h1').should('contain', 'About');

    cy.contains('IDATT2901').should('be.visible');
    cy.contains('NTNU Trondheim').should('be.visible');

    cy.contains('h3', 'Epic').should('be.visible');
    cy.contains('An epic (EPIC) is a major project goal').should('be.visible');

    cy.contains('h3', 'Decision').should('be.visible');
    cy.contains('A decision (DEC) is a choice').should('be.visible');

    cy.contains('h3', 'Deliverable').should('be.visible');
    cy.contains('A deliverable (DEL) is a major result').should('be.visible');

    cy.contains('h3', 'Activity').should('be.visible');
    cy.contains('An activity (ACT) is a means to an end').should('be.visible');

    cy.contains('h3', 'Task').should('be.visible');
    cy.contains('A task (TSK) is an individual').should('be.visible');
  });

  it('should display icons for each metadata type', () => {
    cy.contains('h3', 'Epic').find('svg').should('exist');
    cy.contains('h3', 'Decision').find('svg').should('exist');
    cy.contains('h3', 'Deliverable').find('svg').should('exist');
    cy.contains('h3', 'Activity').find('svg').should('exist');
    cy.contains('h3', 'Task').find('svg').should('exist');
  });
});