describe('Create Metadata Modal', () => {
  beforeEach(() => {
    cy.intercept('GET', 'http://localhost:8000/epics/', []).as('getEpics');
    cy.intercept('GET', 'http://localhost:8000/decisions/', []).as('getDecisions');
    cy.intercept('GET', 'http://localhost:8000/deliverables/', []).as('getDeliverables');
    cy.intercept('GET', 'http://localhost:8000/tasks/', []).as('getTasks');
    cy.intercept('GET', 'http://localhost:8000/activities/', []).as('getActivities');
    cy.visit('/overview');
    cy.wait(['@getEpics', '@getDecisions', '@getDeliverables', '@getTasks', '@getActivities']);
  });

  it('should open create modal', () => {
    cy.contains('button', 'Create New').click();
    cy.get('[role="dialog"]').should('be.visible');
  });

  it('should have all metadata type options', () => {
    cy.contains('button', 'Create New').click();

    cy.get('#create-metadata-type option').should('have.length', 5);
    cy.get('#create-metadata-type option[value="epic"]').should('exist');
    cy.get('#create-metadata-type option[value="decision"]').should('exist');
    cy.get('#create-metadata-type option[value="deliverable"]').should('exist');
    cy.get('#create-metadata-type option[value="task"]').should('exist');
    cy.get('#create-metadata-type option[value="activity"]').should('exist');
  });

  it('should have all form fields visible', () => {
    cy.contains('button', 'Create New').click();

    cy.get('#create-title').should('be.visible');
    cy.get('#create-owner').should('be.visible');
    cy.get('#create-description').should('be.visible');
    cy.contains('button', 'Create').should('exist');
  });

  it('should close modal on cancel', () => {
    cy.contains('button', 'Create New').click();
    cy.get('[role="dialog"]').should('be.visible');

    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Cancel').click({ force: true });
    });

    cy.get('[role="dialog"]').should('not.exist');
  });
});