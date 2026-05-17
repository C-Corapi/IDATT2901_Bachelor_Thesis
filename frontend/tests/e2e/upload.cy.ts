describe('Upload Page', () => {
  beforeEach(() => {
    cy.visit('/upload');
  });

  it('should display upload form with all elements', () => {
    cy.get('h1').should('contain', 'Upload Document');
    cy.get('#file-input').should('exist');
    cy.contains('button', 'Upload & Extract').should('be.disabled');
  });

  it('should enable submit button when file is selected', () => {
    cy.get('#file-input').selectFile({
      contents: Cypress.Buffer.from('test'),
      fileName: 'test.txt',
      mimeType: 'text/plain',
    }, { force: true });

    cy.contains('button', 'Upload & Extract').should('not.be.disabled');
  });

  it('should show file name in dropzone after selection', () => {
    cy.get('#file-input').selectFile({
      contents: Cypress.Buffer.from('content'),
      fileName: 'my-file.txt',
      mimeType: 'text/plain',
    }, { force: true });

    cy.contains('my-file.txt').should('be.visible');
  });

  it('should change extraction type', () => {
    cy.get('#meta-type').select('epic');
    cy.get('#meta-type').should('have.value', 'epic');
  });

  it('should successfully upload and extract metadata', () => {
    // Use /documents/upload NOT /api/documents/upload
    cy.intercept('POST', 'http://localhost:8000/documents/upload', {
      statusCode: 200,
      body: { filename: 'plan.pdf', message: 'Success' },
    }).as('uploadDocument');

    cy.intercept('POST', 'http://localhost:8000/epics/extract?filepath=plan.pdf', [
      { title: 'Build API', description: 'Backend', owner: 'Alice' },
    ]).as('extractEpics');

    cy.intercept('POST', 'http://localhost:8000/decisions/extract?filepath=plan.pdf', []).as('extractDecisions');
    cy.intercept('POST', 'http://localhost:8000/deliverables/extract?filepath=plan.pdf', []).as('extractDeliverables');
    cy.intercept('POST', 'http://localhost:8000/tasks/extract?filepath=plan.pdf', []).as('extractTasks');
    cy.intercept('POST', 'http://localhost:8000/activities/extract?filepath=plan.pdf', []).as('extractActivities');

    cy.get('#file-input').selectFile({
      contents: Cypress.Buffer.from('PDF content'),
      fileName: 'plan.pdf',
      mimeType: 'application/pdf',
    }, { force: true });

    cy.contains('button', 'Upload & Extract').click();

    cy.wait('@uploadDocument');
    cy.wait(['@extractEpics', '@extractDecisions', '@extractDeliverables', '@extractTasks', '@extractActivities']);

    cy.contains('Metadata extraction completed').should('be.visible');
  });

  it('should handle upload errors gracefully', () => {
    cy.intercept('POST', 'http://localhost:8000/documents/upload', {
      statusCode: 500,
    }).as('uploadDocument');

    cy.get('#file-input').selectFile({
      contents: Cypress.Buffer.from('content'),
      fileName: 'broken.txt',
      mimeType: 'text/plain',
    }, { force: true });

    cy.contains('button', 'Upload & Extract').click();

    cy.wait('@uploadDocument');
    cy.contains(/failed|error/i).should('be.visible');
  });

  it('should extract only selected metadata type', () => {
    cy.intercept('POST', 'http://localhost:8000/documents/upload', {
      statusCode: 200,
      body: { filename: 'doc.txt', message: 'Success' },
    }).as('uploadDocument');

    cy.intercept('POST', 'http://localhost:8000/tasks/extract?filepath=doc.txt', [
      { title: 'Task 1', description: 'Do something', owner: 'Bob' },
    ]).as('extractTasks');

    cy.get('#meta-type').select('task');

    cy.get('#file-input').selectFile({
      contents: Cypress.Buffer.from('content'),
      fileName: 'doc.txt',
      mimeType: 'text/plain',
    }, { force: true });

    cy.contains('button', 'Upload & Extract').click();

    cy.wait('@uploadDocument');
    cy.wait('@extractTasks');

    cy.contains('Metadata extraction completed').should('be.visible');
    cy.contains('Task 1').should('be.visible');
  });
});