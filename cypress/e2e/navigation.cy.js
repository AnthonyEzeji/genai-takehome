describe('Navigation Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate through all main routes', () => {
    // Landing page
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.contains('Transform Your Notes with AI').should('be.visible');

    // Navigate to notes page
    cy.contains('Get Started Free').click();
    cy.url().should('include', '/notes');
    cy.contains('Create Note').should('be.visible');

    // Navigate to analytics page
    cy.contains('Analytics').click();
    cy.url().should('include', '/analytics');
    cy.contains('Analytics Dashboard').should('be.visible');

    // Navigate back to notes
    cy.contains('Notes').click();
    cy.url().should('include', '/notes');
    cy.contains('Create Note').should('be.visible');

    // Navigate back to home
    cy.contains('Home').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.contains('Transform Your Notes with AI').should('be.visible');
  });

  it('should show active navigation states', () => {
    // Check home is active
    cy.visit('/');
    cy.get('.nav-tab.active').should('contain', 'Home');

    // Check notes is active
    cy.visit('/notes');
    cy.get('.nav-tab.active').should('contain', 'Notes');

    // Check analytics is active
    cy.visit('/analytics');
    cy.get('.nav-tab.active').should('contain', 'Analytics');
  });

  it('should handle direct URL navigation', () => {
    // Direct navigation to notes
    cy.visit('/notes');
    cy.contains('Create Note').should('be.visible');
    cy.contains('Your Notes').should('be.visible');

    // Direct navigation to analytics
    cy.visit('/analytics');
    cy.contains('Analytics Dashboard').should('be.visible');

    // Invalid route should redirect to home
    cy.visit('/invalid-route');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should maintain navigation state during page interactions', () => {
    cy.visit('/notes');
    
    // Create a note
    cy.get('[placeholder="Enter note title"]').type('Test Note');
    cy.get('[placeholder="Enter note content"]').type('Test content');
    cy.contains('Add Note').click();
    
    // Verify still on notes page
    cy.url().should('include', '/notes');
    cy.get('.nav-tab.active').should('contain', 'Notes');
  });
}); 