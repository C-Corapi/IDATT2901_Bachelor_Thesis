describe('Accessibility', () => {
  beforeEach(() => {
    cy.intercept('GET', 'http://localhost:8000/**', []);
  });

  it('should have proper ARIA landmarks on all pages', () => {
    const pages = ['/overview', '/kanban', '/upload', '/docs', '/about'];

    pages.forEach(page => {
      cy.visit(page);
      cy.get('main').should('exist');
      cy.get('nav').should('exist');
      cy.get('h1').should('exist');
    });
  });

  it('should have proper button states and ARIA attributes', () => {
    cy.visit('/overview');
    cy.contains('button', 'Create New').should('be.visible');
  });

  it('should handle modal accessibility', () => {
    cy.visit('/overview');
    cy.contains('button', 'Create New').click();

    cy.get('[role="dialog"]').should('be.visible');
    cy.get('[role="dialog"]').should('have.attr', 'aria-modal', 'true');

    cy.get('.modal-overlay').click({ force: true });
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('should have proper form labels', () => {
    cy.visit('/overview');
    cy.contains('button', 'Create New').click();

    cy.get('label[for="create-metadata-type"]').should('exist');
    cy.get('label[for="create-title"]').should('exist');
    cy.get('label[for="create-owner"]').should('exist');
    cy.get('label[for="create-description"]').should('exist');
  });
});