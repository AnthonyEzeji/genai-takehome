describe('Error Handling', () => {
  beforeEach(() => {
    cy.visit('/notes');
  });

  describe('Network Error Handling', () => {
    it('should handle AI service network errors gracefully', () => {
      // Mock network error for AI services
      cy.intercept('POST', '**/openai/**', { forceNetworkError: true }).as('aiNetworkError');
      
      // Test auto-title network error
      cy.get('[placeholder="Enter note content"]').type('Test content');
      cy.contains('Auto-Title').click();
      
      // Should show error message
      cy.contains('Error', { timeout: 10000 }).should('be.visible');
      
      // Test content generation network error
      cy.get('[placeholder="Enter bullet points or shorthand to generate content"]').type('Test shorthand');
      cy.contains('Generate').click();
      
      // Should show error message
      cy.contains('Error', { timeout: 10000 }).should('be.visible');
    });

    it('should handle search network errors gracefully', () => {
      // Mock network error for search
      cy.intercept('POST', '**/embeddings/**', { forceNetworkError: true }).as('searchNetworkError');
      
      cy.contains('Show AI Search').click();
      cy.get('[placeholder="Search notes by meaning..."]').type('test search');
      cy.contains('Search').click();
      
      // Should show error message
      cy.contains('Failed to perform semantic search', { timeout: 10000 }).should('be.visible');
      cy.contains('Retry').should('be.visible');
    });

    it('should handle database connection errors', () => {
      // Mock database error
      cy.intercept('POST', '**/supabase/**', { 
        statusCode: 500, 
        body: { error: 'Database connection failed' } 
      }).as('dbError');
      
      // Try to create a note
      cy.get('[placeholder="Enter note title"]').type('Test Note');
      cy.get('[placeholder="Enter note content"]').type('Test content');
      cy.contains('Add Note').click();
      
      // Should show error message
      cy.contains('Error', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('API Error Handling', () => {
    it('should handle OpenAI API rate limiting', () => {
      // Mock rate limit error
      cy.intercept('POST', '**/openai/**', { 
        statusCode: 429, 
        body: { error: { message: 'Rate limit exceeded' } } 
      }).as('rateLimitError');
      
      cy.get('[placeholder="Enter note content"]').type('Test content');
      cy.contains('Auto-Title').click();
      
      // Should show rate limit error
      cy.contains('Rate limit exceeded', { timeout: 10000 }).should('be.visible');
    });

    it('should handle OpenAI API authentication errors', () => {
      // Mock auth error
      cy.intercept('POST', '**/openai/**', { 
        statusCode: 401, 
        body: { error: { message: 'Invalid API key' } } 
      }).as('authError');
      
      cy.get('[placeholder="Enter note content"]').type('Test content');
      cy.contains('Auto-Title').click();
      
      // Should show auth error
      cy.contains('Invalid API key', { timeout: 10000 }).should('be.visible');
    });

    it('should handle malformed API responses', () => {
      // Mock malformed response
      cy.intercept('POST', '**/openai/**', { 
        statusCode: 200, 
        body: 'Invalid JSON response' 
      }).as('malformedResponse');
      
      cy.get('[placeholder="Enter note content"]').type('Test content');
      cy.contains('Auto-Title').click();
      
      // Should show parsing error
      cy.contains('Error', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Input Validation Errors', () => {
    it('should handle empty required fields', () => {
      // Try to submit without title
      cy.get('[placeholder="Enter note content"]').type('Content without title');
      cy.contains('Add Note').should('be.disabled');
      
      // Try to submit without content
      cy.get('[placeholder="Enter note content"]').clear();
      cy.get('[placeholder="Enter note title"]').type('Title without content');
      cy.contains('Add Note').should('be.disabled');
    });

    it('should handle extremely long inputs', () => {
      const veryLongTitle = 'A'.repeat(1000);
      const veryLongContent = 'B'.repeat(10000);
      
      cy.get('[placeholder="Enter note title"]').type(veryLongTitle);
      cy.get('[placeholder="Enter note content"]').type(veryLongContent);
      
      // Should handle long inputs gracefully
      cy.contains('Add Note').should('not.be.disabled');
    });

    it('should handle special characters in inputs', () => {
      const specialTitle = 'Title with @#$%^&*()_+-=[]{}|;:,.<>?';
      const specialContent = 'Content with special chars: @#$%^&*()_+-=[]{}|;:,.<>?';
      
      cy.get('[placeholder="Enter note title"]').type(specialTitle);
      cy.get('[placeholder="Enter note content"]').type(specialContent);
      cy.contains('Add Note').click();
      
      // Should handle special characters
      cy.contains(specialTitle).should('be.visible');
      cy.contains(specialContent).should('be.visible');
    });
  });

  describe('UI Error States', () => {
    it('should show loading states during AI operations', () => {
      // Mock slow AI response
      cy.intercept('POST', '**/openai/**', (req) => {
        req.reply({
          delay: 2000,
          statusCode: 200,
          body: { choices: [{ message: { content: 'Generated Title' } }] }
        });
      }).as('slowAI');
      
      cy.get('[placeholder="Enter note content"]').type('Test content');
      cy.contains('Auto-Title').click();
      
      // Should show loading state
      cy.contains('Generating...').should('be.visible');
      
      // Should complete after delay
      cy.get('[placeholder="Enter note title"]', { timeout: 10000 }).should('not.have.value', '');
    });

    it('should show loading states during search', () => {
      // Mock slow search response
      cy.intercept('POST', '**/embeddings/**', (req) => {
        req.reply({
          delay: 2000,
          statusCode: 200,
          body: []
        });
      }).as('slowSearch');
      
      cy.contains('Show AI Search').click();
      cy.get('[placeholder="Search notes by meaning..."]').type('test search');
      cy.contains('Search').click();
      
      // Should show loading state
      cy.contains('Searching...').should('be.visible');
      
      // Should complete after delay
      cy.contains('No notes found', { timeout: 10000 }).should('be.visible');
    });

    it('should handle concurrent operations gracefully', () => {
      // Start multiple AI operations simultaneously
      cy.get('[placeholder="Enter note content"]').type('Test content');
      cy.contains('Auto-Title').click();
      
      cy.get('[placeholder="Enter bullet points or shorthand to generate content"]').type('Test shorthand');
      cy.contains('Generate').click();
      
      // Should handle both operations
      cy.contains('Generating...').should('be.visible');
    });
  });

  describe('Recovery and Retry', () => {
    it('should allow retry after AI errors', () => {
      // Mock first failure, then success
      cy.intercept('POST', '**/openai/**', { forceNetworkError: true }).as('aiFailure');
      
      cy.get('[placeholder="Enter note content"]').type('Test content');
      cy.contains('Auto-Title').click();
      
      // Wait for error
      cy.contains('Error', { timeout: 10000 }).should('be.visible');
      
      // Mock success for retry
      cy.intercept('POST', '**/openai/**', { 
        statusCode: 200, 
        body: { choices: [{ message: { content: 'Generated Title' } }] } 
      }).as('aiSuccess');
      
      // Retry the operation
      cy.contains('Auto-Title').click();
      
      // Should succeed
      cy.get('[placeholder="Enter note title"]', { timeout: 15000 }).should('not.have.value', '');
    });

    it('should allow retry after search errors', () => {
      // Mock first failure, then success
      cy.intercept('POST', '**/embeddings/**', { forceNetworkError: true }).as('searchFailure');
      
      cy.contains('Show AI Search').click();
      cy.get('[placeholder="Search notes by meaning..."]').type('test search');
      cy.contains('Search').click();
      
      // Wait for error
      cy.contains('Failed to perform semantic search', { timeout: 10000 }).should('be.visible');
      
      // Mock success for retry
      cy.intercept('POST', '**/embeddings/**', { 
        statusCode: 200, 
        body: [] 
      }).as('searchSuccess');
      
      // Click retry
      cy.contains('Retry').click();
      
      // Should succeed
      cy.contains('No notes found', { timeout: 15000 }).should('be.visible');
    });

    it('should clear error states when starting new operations', () => {
      // Mock AI error
      cy.intercept('POST', '**/openai/**', { forceNetworkError: true }).as('aiError');
      
      cy.get('[placeholder="Enter note content"]').type('Test content');
      cy.contains('Auto-Title').click();
      
      // Wait for error
      cy.contains('Error', { timeout: 10000 }).should('be.visible');
      
      // Start typing new content
      cy.get('[placeholder="Enter note content"]').clear().type('New content');
      
      // Error should be cleared
      cy.contains('Error').should('not.exist');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid successive operations', () => {
      // Rapidly click auto-title multiple times
      cy.get('[placeholder="Enter note content"]').type('Test content');
      
      for (let i = 0; i < 5; i++) {
        cy.contains('Auto-Title').click();
      }
      
      // Should handle rapid clicks gracefully
      cy.contains('Generating...').should('be.visible');
    });

    it('should handle browser refresh during operations', () => {
      cy.get('[placeholder="Enter note content"]').type('Test content');
      cy.contains('Auto-Title').click();
      
      // Refresh page during operation
      cy.reload();
      
      // Should recover gracefully
      cy.contains('Create Note').should('be.visible');
    });

    it('should handle navigation during operations', () => {
      cy.get('[placeholder="Enter note content"]').type('Test content');
      cy.contains('Auto-Title').click();
      
      // Navigate away during operation
      cy.visit('/analytics');
      cy.visit('/notes');
      
      // Should recover gracefully
      cy.contains('Create Note').should('be.visible');
    });
  });
}); 