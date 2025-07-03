describe('Analytics Dashboard', () => {
  beforeEach(() => {
    cy.visit('/notes');
    
    // Create test data for analytics
    const notes = [
      { title: 'Work Note 1', content: 'Work content', tags: ['work', 'important'] },
      { title: 'Personal Note 1', content: 'Personal content', tags: ['personal', 'ideas'] },
      { title: 'Work Note 2', content: 'Another work note', tags: ['work', 'meeting'] },
      { title: 'Personal Note 2', content: 'Another personal note', tags: ['personal', 'todo'] },
      { title: 'Ideas Note', content: 'Creative ideas', tags: ['ideas', 'creative'] }
    ];

    notes.forEach(note => {
      cy.get('[placeholder="Enter note title"]').type(note.title);
      cy.get('[placeholder="Enter note content"]').type(note.content);
      
      note.tags.forEach(tag => {
        cy.get('[placeholder="Add tag"]').type(tag + '{enter}');
      });
      
      cy.contains('Add Note').click();
    });
  });

  it('should load analytics dashboard', () => {
    cy.visit('/analytics');
    cy.contains('Analytics Dashboard').should('be.visible');
  });

  it('should display note statistics', () => {
    cy.visit('/analytics');
    
    // Check for basic stats
    cy.contains('Total Notes').should('be.visible');
    cy.contains('5').should('be.visible'); // Should show 5 notes
    
    cy.contains('Total Tags').should('be.visible');
    cy.contains('6').should('be.visible'); // Should show 6 unique tags
  });

  it('should display tag usage chart', () => {
    cy.visit('/analytics');
    
    // Check for tag usage visualization
    cy.contains('Tag Usage').should('be.visible');
    cy.contains('work').should('be.visible');
    cy.contains('personal').should('be.visible');
    cy.contains('ideas').should('be.visible');
  });

  it('should display note creation timeline', () => {
    cy.visit('/analytics');
    
    // Check for timeline chart
    cy.contains('Note Creation Timeline').should('be.visible');
    cy.get('[data-testid="line-chart"]').should('be.visible');
  });

  it('should display most used tags', () => {
    cy.visit('/analytics');
    
    // Check for most used tags section
    cy.contains('Most Used Tags').should('be.visible');
    
    // Verify tag counts
    cy.contains('work').parent().should('contain', '2'); // 2 notes with work tag
    cy.contains('personal').parent().should('contain', '2'); // 2 notes with personal tag
    cy.contains('ideas').parent().should('contain', '2'); // 2 notes with ideas tag
  });

  it('should update analytics when notes are added', () => {
    cy.visit('/analytics');
    
    // Note initial stats
    cy.contains('Total Notes').parent().should('contain', '5');
    
    // Go back to notes and add a new note
    cy.visit('/notes');
    cy.get('[placeholder="Enter note title"]').type('New Analytics Note');
    cy.get('[placeholder="Enter note content"]').type('New content');
    cy.get('[placeholder="Add tag"]').type('analytics{enter}');
    cy.contains('Add Note').click();
    
    // Go back to analytics and check updated stats
    cy.visit('/analytics');
    cy.contains('Total Notes').parent().should('contain', '6');
    cy.contains('analytics').should('be.visible');
  });

  it('should update analytics when notes are deleted', () => {
    cy.visit('/analytics');
    
    // Note initial stats
    cy.contains('Total Notes').parent().should('contain', '5');
    
    // Go back to notes and delete a note
    cy.visit('/notes');
    cy.contains('Work Note 1').parent().find('[aria-label="Delete note"]').click();
    
    // Go back to analytics and check updated stats
    cy.visit('/analytics');
    cy.contains('Total Notes').parent().should('contain', '4');
  });

  it('should display empty state when no notes exist', () => {
    // Delete all notes first
    cy.visit('/notes');
    cy.get('[aria-label="Delete note"]').each(($el) => {
      cy.wrap($el).click();
    });
    
    // Check analytics empty state
    cy.visit('/analytics');
    cy.contains('No data available').should('be.visible');
    cy.contains('Create your first note').should('be.visible');
  });

  it('should handle chart interactions', () => {
    cy.visit('/analytics');
    
    // Check that charts are interactive
    cy.get('[data-testid="bar-chart"]').should('be.visible');
    cy.get('[data-testid="doughnut-chart"]').should('be.visible');
    cy.get('[data-testid="pie-chart"]').should('be.visible');
  });

  it('should display responsive layout', () => {
    cy.visit('/analytics');
    
    // Test different viewport sizes
    cy.viewport(768, 1024); // Tablet
    cy.contains('Analytics Dashboard').should('be.visible');
    
    cy.viewport(375, 667); // Mobile
    cy.contains('Analytics Dashboard').should('be.visible');
    
    cy.viewport(1280, 720); // Desktop
    cy.contains('Analytics Dashboard').should('be.visible');
  });

  it('should maintain analytics state during navigation', () => {
    cy.visit('/analytics');
    
    // Navigate away and back
    cy.visit('/notes');
    cy.visit('/analytics');
    
    // Verify analytics still loads correctly
    cy.contains('Analytics Dashboard').should('be.visible');
    cy.contains('Total Notes').should('be.visible');
  });

  it('should handle analytics with special characters in tags', () => {
    // Create a note with special characters in tags
    cy.visit('/notes');
    cy.get('[placeholder="Enter note title"]').type('Special Tag Note');
    cy.get('[placeholder="Enter note content"]').type('Content with special tags');
    cy.get('[placeholder="Add tag"]').type('special-tag{enter}');
    cy.get('[placeholder="Add tag"]').type('tag_with_underscore{enter}');
    cy.contains('Add Note').click();
    
    // Check analytics handles special characters
    cy.visit('/analytics');
    cy.contains('special-tag').should('be.visible');
    cy.contains('tag_with_underscore').should('be.visible');
  });

  it('should display accurate tag counts', () => {
    cy.visit('/analytics');
    
    // Verify tag counts match the test data
    cy.contains('work').parent().should('contain', '2');
    cy.contains('personal').parent().should('contain', '2');
    cy.contains('ideas').parent().should('contain', '2');
    cy.contains('important').parent().should('contain', '1');
    cy.contains('meeting').parent().should('contain', '1');
    cy.contains('todo').parent().should('contain', '1');
    cy.contains('creative').parent().should('contain', '1');
  });
}); 