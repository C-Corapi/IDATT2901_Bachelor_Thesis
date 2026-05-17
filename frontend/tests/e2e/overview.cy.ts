describe('Overview Page', () => {
  beforeEach(() => {
    cy.intercept('GET', 'http://localhost:8000/epics/', []).as('getEpics');
    cy.intercept('GET', 'http://localhost:8000/decisions/', []).as('getDecisions');
    cy.intercept('GET', 'http://localhost:8000/deliverables/', []).as('getDeliverables');
    cy.intercept('GET', 'http://localhost:8000/tasks/', []).as('getTasks');
    cy.intercept('GET', 'http://localhost:8000/activities/', []).as('getActivities');
  });

  it('should display stats summary with correct structure', () => {
    cy.visit('/overview');
    cy.wait(['@getEpics', '@getDecisions', '@getDeliverables', '@getTasks', '@getActivities']);

    cy.contains('.stat-label', 'Total').should('exist');
    cy.contains('.stat-label', 'Epics').should('exist');
    cy.contains('.stat-label', 'Tasks').should('exist');
  });

  it('should open and close create modal', () => {
    cy.visit('/overview');
    cy.wait(['@getEpics', '@getDecisions', '@getDeliverables', '@getTasks', '@getActivities']);

    cy.contains('button', 'Create New').click();
    cy.get('[role="dialog"]').should('be.visible');

    cy.get('.modal-overlay').click({ force: true });
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('should have filter tabs', () => {
    cy.visit('/overview');
    cy.wait(['@getEpics', '@getDecisions', '@getDeliverables', '@getTasks', '@getActivities']);

    // Check that all filter buttons exist
    cy.contains('button', 'All').should('be.visible');
    cy.contains('button', 'Epics').should('be.visible');
    cy.contains('button', 'Decisions').should('be.visible');
    cy.contains('button', 'Deliverables').should('be.visible');
    cy.contains('button', 'Tasks').should('be.visible');
    cy.contains('button', 'Activities').should('be.visible');
  });

  it('should display empty state with no data', () => {
    cy.visit('/overview');
    cy.wait(['@getEpics', '@getDecisions', '@getDeliverables', '@getTasks', '@getActivities']);

    // With no data, all stats should show 0
    cy.get('.stat-value').each(($el) => {
      expect($el.text()).to.equal('0');
    });
  });
});