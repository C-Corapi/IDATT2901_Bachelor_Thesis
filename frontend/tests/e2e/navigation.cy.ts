describe('Navigation', () => {
  beforeEach(() => {
    // Intercept API calls to prevent real backend calls
    cy.intercept('GET', 'http://localhost:8000/epics/', []).as('getEpics');
    cy.intercept('GET', 'http://localhost:8000/decisions/', []).as('getDecisions');
    cy.intercept('GET', 'http://localhost:8000/deliverables/', []).as('getDeliverables');
    cy.intercept('GET', 'http://localhost:8000/tasks/', []).as('getTasks');
    cy.intercept('GET', 'http://localhost:8000/activities/', []).as('getActivities');
    cy.intercept('GET', 'http://localhost:8000/docs/', []).as('getDocuments');
  });

  it('should navigate between all pages', () => {
    // Start at root
    cy.visit('/');

    // Should redirect to Overview
    cy.url().should('include', '/overview');
    cy.get('h1').should('contain', 'Metadata Overview');

    // Navigate to Kanban
    cy.contains('a', 'Kanban').click();
    cy.url().should('include', '/kanban');
    cy.get('h1').should('contain', 'Kanban Board');

    // Navigate to Upload
    cy.contains('a', 'Upload').click();
    cy.url().should('include', '/upload');
    cy.get('h1').should('contain', 'Upload Document');

    // Navigate to Documents
    cy.contains('a', 'Documents').click();
    cy.url().should('include', '/docs');
    cy.get('h1').should('contain', 'Uploaded Documents');

    // Navigate to About
    cy.contains('a', 'About').click();
    cy.url().should('include', '/about');
    cy.get('h1').should('contain', 'About');
  });

  it('should highlight active navigation link', () => {
    cy.visit('/overview');

    // Overview link should be active
    cy.contains('a', 'Overview')
      .should('have.class', 'nav-link--active');

    // Click Kanban
    cy.contains('a', 'Kanban').click();

    // Kanban link should now be active
    cy.contains('a', 'Kanban')
      .should('have.class', 'nav-link--active');

    // Overview link should no longer be active
    cy.contains('a', 'Overview')
      .should('not.have.class', 'nav-link--active');
  });
});