describe('GenAI Notes E2E Smoke Test', () => {
  it('loads the landing page', () => {
    cy.visit('/');
    cy.contains('Transform Your Notes with AI').should('be.visible');
    cy.contains('Get Started Free').should('be.visible');
  });

  it('navigates to the notes page', () => {
    cy.visit('/');
    cy.contains('Get Started Free').click();
    cy.url().should('include', '/notes');
    cy.contains('Create Note').should('be.visible');
    cy.contains('Show AI Search').should('be.visible');
  });

  it('shows the analytics page', () => {
    cy.visit('/analytics');
    cy.contains('Analytics Dashboard').should('be.visible');
  });

  it('creates a basic note', () => {
    cy.visit('/notes');
    cy.get('[placeholder="Enter note title"]').type('Smoke Test Note');
    cy.get('[placeholder="Enter note content"]').type('This is a smoke test note');
    cy.contains('Add Note').click();
    cy.contains('Smoke Test Note').should('be.visible');
  });

  it('navigates between all pages', () => {
    cy.visit('/');
    cy.contains('Get Started Free').click();
    cy.url().should('include', '/notes');
    
    cy.contains('Analytics').click();
    cy.url().should('include', '/analytics');
    
    cy.contains('Home').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
}); 