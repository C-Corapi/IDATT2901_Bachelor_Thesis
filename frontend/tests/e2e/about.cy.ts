describe('About Page', () => {
  beforeEach(() => {
    cy.visit('/about');
  });

  it('should display all metadata types information', () => {
    cy.get('h1').should('contain', 'About');

    cy.contains('IDATT2901').should('be.visible');
    cy.contains('NTNU Trondheim').should('be.visible');

    cy.contains('h3', 'Epic').should('be.visible');
    cy.contains('Major planned features or capabilities').should('be.visible');

    cy.contains('h3', 'Decision').should('be.visible');
    cy.contains('Decisions with alternatives').should('be.visible');

    cy.contains('h3', 'Deliverable').should('be.visible');
    cy.contains('Tangible or intangible').should('be.visible');

    cy.contains('h3', 'Activity').should('be.visible');
    cy.contains('Ongoing project activities').should('be.visible');

    cy.contains('h3', 'Task').should('be.visible');
    cy.contains('Individual actionable').should('be.visible');
  });

  it('should display icons for each metadata type', () => {
    cy.contains('h3', 'Epic').find('svg').should('exist');
    cy.contains('h3', 'Decision').find('svg').should('exist');
    cy.contains('h3', 'Deliverable').find('svg').should('exist');
    cy.contains('h3', 'Activity').find('svg').should('exist');
    cy.contains('h3', 'Task').find('svg').should('exist');
  });
});