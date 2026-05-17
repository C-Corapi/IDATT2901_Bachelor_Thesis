describe('Document Management', () => {
  beforeEach(() => {
    cy.intercept('GET', 'http://localhost:8000/documents/', []).as('getDocuments');
  });

  it('should display empty state when no documents exist', () => {
    cy.visit('/docs');
    cy.wait('@getDocuments');

    cy.contains('No documents yet').should('be.visible');
  });

  it('should navigate to upload page from empty state', () => {
    cy.visit('/docs');
    cy.wait('@getDocuments');

    cy.contains('button', 'Upload one →').click();
    cy.url().should('include', '/upload');
  });

  it('should display list of uploaded documents', () => {
    cy.intercept('GET', 'http://localhost:8000/documents/', [
      'project-plan.pdf',
      'requirements.docx',
    ]).as('getDocuments');

    cy.visit('/docs');
    cy.wait('@getDocuments');

    cy.contains('.doc-name', 'project-plan.pdf').should('be.visible');
    cy.contains('.doc-name', 'requirements.docx').should('be.visible');

    // Fix: Use .get() instead of .contains() for counting
    cy.get('button').filter(':contains("View")').should('have.length', 2);
  });

  it('should open document viewer modal', () => {
    cy.intercept('GET', 'http://localhost:8000/documents/', ['test.txt']).as('getDocuments');
    cy.intercept('GET', 'http://localhost:8000/documents/test.txt', {
      statusCode: 200,
      headers: { 'content-type': 'text/plain' },
      body: 'Content here',
    }).as('getDocument');

    cy.visit('/docs');
    cy.wait('@getDocuments');

    cy.contains('button', 'View').click();

    cy.get('[role="dialog"]').should('be.visible');
    cy.wait('@getDocument');

    cy.get('[role="dialog"]').contains('h2', 'test.txt').should('be.visible');
    cy.get('.document-viewer').should('be.visible');
  });

  it('should close modal when clicking Close button', () => {
    cy.intercept('GET', 'http://localhost:8000/documents/', ['report.txt']).as('getDocuments');
    cy.intercept('GET', 'http://localhost:8000/documents/report.txt', 'Report').as('getDocument');

    cy.visit('/docs');
    cy.wait('@getDocuments');

    cy.contains('button', 'View').click();
    cy.wait('@getDocument');

    cy.contains('button', 'Close').click();
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('should close modal when clicking overlay', () => {
    cy.intercept('GET', 'http://localhost:8000/documents/', ['report.txt']).as('getDocuments');
    cy.intercept('GET', 'http://localhost:8000/documents/report.txt', 'Report').as('getDocument');

    cy.visit('/docs');
    cy.wait('@getDocuments');

    cy.contains('button', 'View').click();
    cy.wait('@getDocument');

    cy.get('.modal-overlay').click({ force: true });
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('should handle document load error gracefully', () => {
    cy.intercept('GET', 'http://localhost:8000/documents/', ['broken.txt']).as('getDocuments');
    cy.intercept('GET', 'http://localhost:8000/documents/broken.txt', {
      statusCode: 500,
    }).as('getDocument');

    cy.visit('/docs');
    cy.wait('@getDocuments');

    cy.contains('button', 'View').click();
    cy.wait('@getDocument');

    cy.contains('Unable to load document').should('be.visible');
  });

  it('should have delete button for documents', () => {
    cy.intercept('GET', 'http://localhost:8000/documents/', ['doc1.txt']).as('getDocuments');

    cy.visit('/docs');
    cy.wait('@getDocuments');

    // Just check that delete button exists
    cy.contains('.doc-row', 'doc1.txt').within(() => {
      cy.contains('button', 'Delete').should('exist');
    });
  });

  it('should cancel document deletion', () => {
    cy.intercept('GET', 'http://localhost:8000/documents/', ['important.txt']).as('getDocuments');

    cy.visit('/docs');
    cy.wait('@getDocuments');

    cy.contains('.doc-row', 'important.txt').within(() => {
      cy.contains('button', 'Delete').click();
    });

    // Cancel deletion
    cy.contains('button', /cancel|no/i).click();

    // Document should still be there
    cy.contains('.doc-name', 'important.txt').should('be.visible');
  });
});