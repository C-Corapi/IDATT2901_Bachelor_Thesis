describe('Kanban Board', () => {
  beforeEach(() => {
    cy.intercept('GET', 'http://localhost:8000/epics/', []).as('getEpics');
    cy.intercept('GET', 'http://localhost:8000/decisions/', []).as('getDecisions');
    cy.intercept('GET', 'http://localhost:8000/deliverables/', []).as('getDeliverables');
    cy.intercept('GET', 'http://localhost:8000/tasks/', []).as('getTasks');
    cy.intercept('GET', 'http://localhost:8000/activities/', []).as('getActivities');
  });

  it('should display kanban columns', () => {
    cy.visit('/kanban');
    cy.wait(['@getEpics', '@getDecisions', '@getDeliverables', '@getTasks', '@getActivities']);

    cy.contains('h2', 'To Do').should('be.visible');
    cy.contains('h2', 'In Progress').should('be.visible');
    cy.contains('h2', 'Done').should('be.visible');
  });

  it('should toggle backlog column visibility', () => {
    cy.visit('/kanban');
    cy.wait(['@getEpics', '@getDecisions', '@getDeliverables', '@getTasks', '@getActivities']);

    cy.get('input[aria-label="Show backlog column"]').check();
    cy.contains('h2', 'Backlog').should('be.visible');

    cy.get('input[aria-label="Show backlog column"]').uncheck();
    cy.contains('h2', 'Backlog').should('not.exist');
  });

  it('should rename a column', () => {
    cy.visit('/kanban');
    cy.wait(['@getEpics', '@getDecisions', '@getDeliverables', '@getTasks', '@getActivities']);

    cy.contains('h2', 'To Do')
      .parent()
      .find('button[aria-label*="Rename"]')
      .click();

    cy.get('input[value="To Do"]').clear().type('Ready{enter}');

    cy.contains('h2', 'Ready').should('be.visible');
  });
});