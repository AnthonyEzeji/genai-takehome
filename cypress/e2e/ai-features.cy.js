describe('AI Features', () => {
  beforeEach(() => {
    cy.visit('/notes');
  });

  describe('Auto-Title Feature', () => {
    it('should generate title from content', () => {
      const content = 'Meeting notes from today\'s brainstorming session about the new product launch';
      
      cy.get('[placeholder="Enter note content"]').type(content);
      cy.contains('Auto-Title').click();
      
      // Wait for AI response
      cy.contains('Generating...', { timeout: 10000 }).should('be.visible');
      
      // Verify title is generated
      cy.get('[placeholder="Enter note title"]', { timeout: 15000 }).should('not.have.value', '');
    });

    it('should handle auto-title with empty content', () => {
      cy.contains('Auto-Title').click();
      
      // Should show error or remain disabled
      cy.get('[placeholder="Enter note title"]').should('have.value', '');
    });

    it('should handle auto-title error gracefully', () => {
      // Mock network error by disconnecting
      cy.intercept('POST', '**/openai/**', { forceNetworkError: true }).as('aiRequest');
      
      const content = 'Test content for auto-title';
      cy.get('[placeholder="Enter note content"]').type(content);
      cy.contains('Auto-Title').click();
      
      // Should show error message
      cy.contains('Error', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Content Generation from Shorthand', () => {
    it('should generate content from shorthand', () => {
      const shorthand = 'Meeting agenda:\n- Review Q4 results\n- Plan Q1 strategy\n- Discuss team expansion';
      
      cy.get('[placeholder="Enter bullet points or shorthand to generate content"]').type(shorthand);
      cy.contains('Generate').click();
      
      // Wait for AI response
      cy.contains('Generating...', { timeout: 10000 }).should('be.visible');
      
      // Verify content is generated
      cy.get('[placeholder="Enter note content"]', { timeout: 15000 }).should('not.have.value', '');
    });

    it('should handle content generation with empty shorthand', () => {
      cy.contains('Generate').should('be.disabled');
    });

    it('should handle content generation error gracefully', () => {
      // Mock network error
      cy.intercept('POST', '**/openai/**', { forceNetworkError: true }).as('aiRequest');
      
      const shorthand = 'Test shorthand';
      cy.get('[placeholder="Enter bullet points or shorthand to generate content"]').type(shorthand);
      cy.contains('Generate').click();
      
      // Should show error message
      cy.contains('Error', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Semantic Search', () => {
    beforeEach(() => {
      // Create some test notes first
      const notes = [
        { title: 'Meeting Notes', content: 'Discussed project timeline and budget allocation' },
        { title: 'Ideas', content: 'New feature ideas for the mobile app' },
        { title: 'Todo List', content: 'Tasks to complete this week' }
      ];

      notes.forEach(note => {
        cy.get('[placeholder="Enter note title"]').type(note.title);
        cy.get('[placeholder="Enter note content"]').type(note.content);
        cy.contains('Add Note').click();
      });
    });

    it('should perform semantic search', () => {
      // Show AI Search section
      cy.contains('Show AI Search').click();
      
      // Perform search
      cy.get('[placeholder="Search notes by meaning..."]').type('project timeline');
      cy.contains('Search').click();
      
      // Wait for results
      cy.contains('Searching...', { timeout: 10000 }).should('be.visible');
      
      // Verify results appear
      cy.contains('Found', { timeout: 15000 }).should('be.visible');
    });

    it('should handle empty search query', () => {
      cy.contains('Show AI Search').click();
      cy.get('[placeholder="Search notes by meaning..."]').type('   ');
      cy.contains('Search').should('be.disabled');
    });

    it('should clear search results', () => {
      cy.contains('Show AI Search').click();
      
      // Perform search
      cy.get('[placeholder="Search notes by meaning..."]').type('test search');
      cy.contains('Search').click();
      
      // Wait for results and clear button to appear
      cy.contains('Clear', { timeout: 15000 }).should('be.visible');
      
      // Clear search
      cy.contains('Clear').click();
      
      // Verify search is cleared
      cy.get('[placeholder="Search notes by meaning..."]').should('have.value', '');
      cy.contains('Clear').should('not.exist');
    });

    it('should handle search with no results', () => {
      cy.contains('Show AI Search').click();
      
      // Search for something that shouldn't exist
      cy.get('[placeholder="Search notes by meaning..."]').type('nonexistent content that should not match');
      cy.contains('Search').click();
      
      // Should show no results message
      cy.contains('No notes found', { timeout: 15000 }).should('be.visible');
    });

    it('should handle search error gracefully', () => {
      // Mock search error
      cy.intercept('POST', '**/embeddings/**', { forceNetworkError: true }).as('searchRequest');
      
      cy.contains('Show AI Search').click();
      cy.get('[placeholder="Search notes by meaning..."]').type('test search');
      cy.contains('Search').click();
      
      // Should show error message
      cy.contains('Failed to perform semantic search', { timeout: 10000 }).should('be.visible');
      cy.contains('Retry').should('be.visible');
    });

    it('should retry failed search', () => {
      // First, mock a failure
      cy.intercept('POST', '**/embeddings/**', { forceNetworkError: true }).as('searchRequest1');
      
      cy.contains('Show AI Search').click();
      cy.get('[placeholder="Search notes by meaning..."]').type('test search');
      cy.contains('Search').click();
      
      // Wait for error
      cy.contains('Failed to perform semantic search', { timeout: 10000 }).should('be.visible');
      
      // Mock success for retry
      cy.intercept('POST', '**/embeddings/**', { 
        statusCode: 200, 
        body: [{ id: '1', title: 'Meeting Notes', content: 'Test content', similarity: 0.8 }] 
      }).as('searchRequest2');
      
      // Click retry
      cy.contains('Retry').click();
      
      // Should show results
      cy.contains('Found', { timeout: 15000 }).should('be.visible');
    });
  });

  describe('AI Integration Workflow', () => {
    it('should complete full AI-assisted note creation workflow', () => {
      // Generate content from shorthand
      const shorthand = 'Weekly team meeting:\n- Discussed project progress\n- Planned next sprint\n- Identified blockers';
      
      cy.get('[placeholder="Enter bullet points or shorthand to generate content"]').type(shorthand);
      cy.contains('Generate').click();
      
      // Wait for content generation
      cy.get('[placeholder="Enter note content"]', { timeout: 15000 }).should('not.have.value', '');
      
      // Generate title from content
      cy.contains('Auto-Title').click();
      
      // Wait for title generation
      cy.get('[placeholder="Enter note title"]', { timeout: 15000 }).should('not.have.value', '');
      
      // Add tags
      cy.get('[placeholder="Add tag"]').type('meeting{enter}');
      cy.get('[placeholder="Add tag"]').type('weekly{enter}');
      
      // Save the note
      cy.contains('Add Note').click();
      
      // Verify note is created
      cy.get('[placeholder="Enter note title"]').should('have.value', '');
      cy.get('[placeholder="Enter note content"]').should('have.value', '');
    });
  });
}); 