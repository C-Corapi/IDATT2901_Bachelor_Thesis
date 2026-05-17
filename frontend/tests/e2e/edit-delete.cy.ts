describe('Card Interactions', () => {
  beforeEach(() => {
    cy.intercept('GET', 'http://localhost:8000/epics/', []).as('getEpics');
    cy.intercept('GET', 'http://localhost:8000/decisions/', []).as('getDecisions');
    cy.intercept('GET', 'http://localhost:8000/deliverables/', []).as('getDeliverables');
    cy.intercept('GET', 'http://localhost:8000/tasks/', []).as('getTasks');
    cy.intercept('GET', 'http://localhost:8000/activities/', []).as('getActivities');
  });

  it('should display edit and delete buttons when card is expanded', () => {
    cy.intercept('GET', 'http://localhost:8000/epics/', [
      {
        id: 1,
        title: 'Test Epic',
        owner: 'Alice',
        description: 'Test description',
        kanban_status: 'todo',
      },
    ]).as('getEpics');

    cy.visit('/overview');
    cy.wait(['@getEpics', '@getDecisions', '@getDeliverables', '@getTasks', '@getActivities']);

    cy.contains('.card', 'Test Epic').should('have.attr', 'aria-expanded', 'false');
    cy.contains('.card', 'Test Epic').click();
    cy.contains('.card', 'Test Epic').should('have.attr', 'aria-expanded', 'true');

    cy.contains('.card', 'Test Epic').within(() => {
      cy.contains('button', 'Edit').should('be.visible');
      cy.contains('button', 'Delete').should('be.visible');
    });
  });

  it('should display cards on kanban board', () => {
    cy.visit('/kanban');
    cy.wait(['@getEpics', '@getDecisions', '@getDeliverables', '@getTasks', '@getActivities']);

    // Verify kanban columns are present
    cy.contains('h2', 'To Do').should('be.visible');
    cy.contains('h2', 'In Progress').should('be.visible');
    cy.contains('h2', 'Done').should('be.visible');
  });
});