describe('Note Creation and Management', () => {
  beforeEach(() => {
    cy.visit('/notes');
  });

  it('should create a basic note', () => {
    const title = 'Test Note ' + Date.now();
    const content = 'This is a test note content';

    cy.get('[placeholder="Enter note title"]').type(title);
    cy.get('[placeholder="Enter note content"]').type(content);
    cy.contains('Add Note').click();

    // Verify note appears in the list
    cy.contains(title).should('be.visible');
    cy.contains(content).should('be.visible');

    // Verify form is cleared
    cy.get('[placeholder="Enter note title"]').should('have.value', '');
    cy.get('[placeholder="Enter note content"]').should('have.value', '');
  });

  it('should create a note with tags', () => {
    const title = 'Tagged Note ' + Date.now();
    const content = 'This note has tags';
    const tag = 'important';

    cy.get('[placeholder="Enter note title"]').type(title);
    cy.get('[placeholder="Enter note content"]').type(content);
    
    // Add tag
    cy.get('[placeholder="Add tag"]').type(tag);
    cy.get('[placeholder="Add tag"]').type('{enter}');
    
    cy.contains('Add Note').click();

    // Verify note and tag appear
    cy.contains(title).should('be.visible');
    cy.contains(tag).should('be.visible');
  });

  it('should validate required fields', () => {
    // Try to submit without title
    cy.get('[placeholder="Enter note content"]').type('Content without title');
    cy.contains('Add Note').should('be.disabled');

    // Try to submit without content
    cy.get('[placeholder="Enter note content"]').clear();
    cy.get('[placeholder="Enter note title"]').type('Title without content');
    cy.contains('Add Note').should('be.disabled');
  });

  it('should edit an existing note', () => {
    // Create a note first
    const originalTitle = 'Original Title ' + Date.now();
    const originalContent = 'Original content';
    
    cy.get('[placeholder="Enter note title"]').type(originalTitle);
    cy.get('[placeholder="Enter note content"]').type(originalContent);
    cy.contains('Add Note').click();

    // Edit the note
    cy.contains(originalTitle).click();
    cy.get('[placeholder="Enter note title"]').clear().type('Updated Title');
    cy.get('[placeholder="Enter note content"]').clear().type('Updated content');
    cy.contains('Update Note').click();

    // Verify changes
    cy.contains('Updated Title').should('be.visible');
    cy.contains('Updated content').should('be.visible');
    cy.contains(originalTitle).should('not.exist');
  });

  it('should delete a note', () => {
    // Create a note first
    const title = 'Note to Delete ' + Date.now();
    cy.get('[placeholder="Enter note title"]').type(title);
    cy.get('[placeholder="Enter note content"]').type('Content to delete');
    cy.contains('Add Note').click();

    // Verify note exists
    cy.contains(title).should('be.visible');

    // Delete the note
    cy.contains(title).parent().find('[aria-label="Delete note"]').click();
    
    // Verify note is removed
    cy.contains(title).should('not.exist');
  });

  it('should handle multiple notes', () => {
    const notes = [
      { title: 'First Note ' + Date.now(), content: 'First content' },
      { title: 'Second Note ' + Date.now(), content: 'Second content' },
      { title: 'Third Note ' + Date.now(), content: 'Third content' }
    ];

    // Create multiple notes
    notes.forEach(note => {
      cy.get('[placeholder="Enter note title"]').type(note.title);
      cy.get('[placeholder="Enter note content"]').type(note.content);
      cy.contains('Add Note').click();
    });

    // Verify all notes are displayed
    notes.forEach(note => {
      cy.contains(note.title).should('be.visible');
      cy.contains(note.content).should('be.visible');
    });
  });

  it('should handle long content', () => {
    const title = 'Long Note ' + Date.now();
    const longContent = 'A'.repeat(1000); // Very long content

    cy.get('[placeholder="Enter note title"]').type(title);
    cy.get('[placeholder="Enter note content"]').type(longContent);
    cy.contains('Add Note').click();

    // Verify note is created successfully
    cy.contains(title).should('be.visible');
  });

  it('should handle special characters in notes', () => {
    const title = 'Special Note @#$%^&*() ' + Date.now();
    const content = 'Content with special chars: @#$%^&*()_+-=[]{}|;:,.<>?';

    cy.get('[placeholder="Enter note title"]').type(title);
    cy.get('[placeholder="Enter note content"]').type(content);
    cy.contains('Add Note').click();

    // Verify note with special characters is created
    cy.contains(title).should('be.visible');
    cy.contains(content).should('be.visible');
  });
}); 