describe('Tag Filtering', () => {
  beforeEach(() => {
    cy.visit('/notes');
    
    // Create test notes with different tags
    const notes = [
      { title: 'Work Note 1', content: 'Work related content', tags: ['work', 'important'] },
      { title: 'Personal Note 1', content: 'Personal content', tags: ['personal', 'ideas'] },
      { title: 'Work Note 2', content: 'Another work note', tags: ['work', 'meeting'] },
      { title: 'Personal Note 2', content: 'Another personal note', tags: ['personal', 'todo'] },
      { title: 'Mixed Note', content: 'Mixed content', tags: ['work', 'personal'] }
    ];

    notes.forEach(note => {
      cy.get('[placeholder="Enter note title"]').type(note.title);
      cy.get('[placeholder="Enter note content"]').type(note.content);
      
      // Add tags
      note.tags.forEach(tag => {
        cy.get('[placeholder="Add tag"]').type(tag + '{enter}');
      });
      
      cy.contains('Add Note').click();
    });
  });

  it('should display all notes by default', () => {
    // Verify all notes are visible initially
    cy.contains('Work Note 1').should('be.visible');
    cy.contains('Personal Note 1').should('be.visible');
    cy.contains('Work Note 2').should('be.visible');
    cy.contains('Personal Note 2').should('be.visible');
    cy.contains('Mixed Note').should('be.visible');
  });

  it('should filter by single tag', () => {
    // Click on 'work' tag
    cy.contains('work').click();
    
    // Verify only work-related notes are shown
    cy.contains('Work Note 1').should('be.visible');
    cy.contains('Work Note 2').should('be.visible');
    cy.contains('Mixed Note').should('be.visible');
    
    // Verify personal-only notes are hidden
    cy.contains('Personal Note 1').should('not.exist');
    cy.contains('Personal Note 2').should('not.exist');
  });

  it('should filter by multiple tags', () => {
    // Click on 'important' tag
    cy.contains('important').click();
    
    // Verify only important notes are shown
    cy.contains('Work Note 1').should('be.visible');
    
    // Verify other notes are hidden
    cy.contains('Work Note 2').should('not.exist');
    cy.contains('Personal Note 1').should('not.exist');
    cy.contains('Personal Note 2').should('not.exist');
    cy.contains('Mixed Note').should('not.exist');
  });

  it('should clear tag filter', () => {
    // Apply a filter first
    cy.contains('work').click();
    
    // Verify filter is applied
    cy.contains('Personal Note 1').should('not.exist');
    
    // Clear the filter
    cy.contains('Clear Filter').click();
    
    // Verify all notes are visible again
    cy.contains('Work Note 1').should('be.visible');
    cy.contains('Personal Note 1').should('be.visible');
    cy.contains('Work Note 2').should('be.visible');
    cy.contains('Personal Note 2').should('be.visible');
    cy.contains('Mixed Note').should('be.visible');
  });

  it('should show tag counts', () => {
    // Verify tag counts are displayed
    cy.contains('work').parent().should('contain', '3'); // 3 notes with work tag
    cy.contains('personal').parent().should('contain', '3'); // 3 notes with personal tag
    cy.contains('important').parent().should('contain', '1'); // 1 note with important tag
  });

  it('should handle tag filter with no results', () => {
    // Click on a tag that doesn't exist
    cy.contains('nonexistent').click();
    
    // Should show no results message
    cy.contains('No notes found').should('be.visible');
  });

  it('should maintain filter state during note operations', () => {
    // Apply a filter
    cy.contains('work').click();
    
    // Verify filter is applied
    cy.contains('Personal Note 1').should('not.exist');
    
    // Edit a visible note
    cy.contains('Work Note 1').click();
    cy.get('[placeholder="Enter note title"]').clear().type('Updated Work Note');
    cy.contains('Update Note').click();
    
    // Verify filter is still applied
    cy.contains('Updated Work Note').should('be.visible');
    cy.contains('Personal Note 1').should('not.exist');
  });

  it('should handle tag filter with newly created notes', () => {
    // Apply a filter first
    cy.contains('work').click();
    
    // Create a new note with the same tag
    cy.get('[placeholder="Enter note title"]').type('New Work Note');
    cy.get('[placeholder="Enter note content"]').type('New work content');
    cy.get('[placeholder="Add tag"]').type('work{enter}');
    cy.contains('Add Note').click();
    
    // Verify new note appears in filtered results
    cy.contains('New Work Note').should('be.visible');
    cy.contains('Personal Note 1').should('not.exist');
  });

  it('should handle tag filter with deleted notes', () => {
    // Apply a filter
    cy.contains('work').click();
    
    // Delete a note that matches the filter
    cy.contains('Work Note 1').parent().find('[aria-label="Delete note"]').click();
    
    // Verify note is removed from filtered results
    cy.contains('Work Note 1').should('not.exist');
    
    // Verify other work notes are still visible
    cy.contains('Work Note 2').should('be.visible');
    cy.contains('Mixed Note').should('be.visible');
  });

  it('should handle multiple tag selections', () => {
    // Select multiple tags
    cy.contains('work').click();
    cy.contains('important').click();
    
    // Should show notes that match both tags (intersection)
    cy.contains('Work Note 1').should('be.visible'); // Has both work and important
    cy.contains('Work Note 2').should('not.exist'); // Has work but not important
    cy.contains('Personal Note 1').should('not.exist'); // Has neither
  });

  it('should update tag counts after note operations', () => {
    // Check initial counts
    cy.contains('work').parent().should('contain', '3');
    
    // Delete a work note
    cy.contains('Work Note 1').parent().find('[aria-label="Delete note"]').click();
    
    // Verify count is updated
    cy.contains('work').parent().should('contain', '2');
  });
}); 