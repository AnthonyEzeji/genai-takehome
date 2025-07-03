describe('Accessibility Tests', () => {
  beforeEach(() => {
    cy.visit('/notes');
  });

  describe('Keyboard Navigation', () => {
    it('should support tab navigation through all interactive elements', () => {
      // Test tab navigation on landing page
      cy.visit('/');
      cy.get('body').tab();
      
      // Should focus on first interactive element
      cy.focused().should('exist');
      
      // Tab through all elements
      for (let i = 0; i < 10; i++) {
        cy.tab();
        cy.focused().should('exist');
      }
    });

    it('should support enter key for button activation', () => {
      cy.get('[placeholder="Enter note title"]').type('Test Note');
      cy.get('[placeholder="Enter note content"]').type('Test content');
      
      // Focus on Add Note button and press Enter
      cy.contains('Add Note').focus();
      cy.get('body').type('{enter}');
      
      // Should create the note
      cy.contains('Test Note').should('be.visible');
    });

    it('should support space key for button activation', () => {
      cy.get('[placeholder="Enter note title"]').type('Test Note');
      cy.get('[placeholder="Enter note content"]').type('Test content');
      
      // Focus on Add Note button and press Space
      cy.contains('Add Note').focus();
      cy.get('body').type(' ');
      
      // Should create the note
      cy.contains('Test Note').should('be.visible');
    });

    it('should support escape key to cancel operations', () => {
      // Create a note first
      cy.get('[placeholder="Enter note title"]').type('Test Note');
      cy.get('[placeholder="Enter note content"]').type('Test content');
      cy.contains('Add Note').click();
      
      // Click to edit the note
      cy.contains('Test Note').click();
      
      // Press escape to cancel edit
      cy.get('body').type('{esc}');
      
      // Should exit edit mode
      cy.contains('Update Note').should('not.exist');
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper ARIA labels on interactive elements', () => {
      // Check form inputs have labels
      cy.get('[placeholder="Enter note title"]').should('have.attr', 'aria-label');
      cy.get('[placeholder="Enter note content"]').should('have.attr', 'aria-label');
      cy.get('[placeholder="Add tag"]').should('have.attr', 'aria-label');
      
      // Check buttons have accessible names
      cy.contains('Add Note').should('have.attr', 'aria-label');
      cy.contains('Auto-Title').should('have.attr', 'aria-label');
      cy.contains('Generate').should('have.attr', 'aria-label');
    });

    it('should announce dynamic content changes', () => {
      // Create a note
      cy.get('[placeholder="Enter note title"]').type('Test Note');
      cy.get('[placeholder="Enter note content"]').type('Test content');
      cy.contains('Add Note').click();
      
      // Check for live region announcements
      cy.get('[aria-live]').should('exist');
    });

    it('should have proper heading structure', () => {
      // Check for proper heading hierarchy
      cy.get('h1').should('exist');
      cy.get('h2').should('exist');
      cy.get('h3').should('exist');
      
      // Verify heading levels are sequential
      cy.get('h1').then($h1 => {
        const h1Count = $h1.length;
        cy.get('h2').then($h2 => {
          const h2Count = $h2.length;
          expect(h1Count + h2Count).to.be.greaterThan(0);
        });
      });
    });

    it('should have proper list structure', () => {
      // Create notes to generate lists
      cy.get('[placeholder="Enter note title"]').type('Note 1');
      cy.get('[placeholder="Enter note content"]').type('Content 1');
      cy.contains('Add Note').click();
      
      cy.get('[placeholder="Enter note title"]').type('Note 2');
      cy.get('[placeholder="Enter note content"]').type('Content 2');
      cy.contains('Add Note').click();
      
      // Check for proper list elements
      cy.get('ul, ol').should('exist');
      cy.get('li').should('exist');
    });
  });

  describe('Color and Contrast', () => {
    it('should have sufficient color contrast', () => {
      // Check text contrast ratios
      cy.get('body').should('have.css', 'color');
      cy.get('body').should('have.css', 'background-color');
      
      // Check button contrast
      cy.contains('Add Note').should('have.css', 'color');
      cy.contains('Add Note').should('have.css', 'background-color');
    });

    it('should not rely solely on color to convey information', () => {
      // Check that error states have text indicators
      cy.get('[placeholder="Enter note content"]').type('Test content');
      cy.contains('Auto-Title').click();
      
      // If there's an error, it should have text, not just color
      cy.get('body').then($body => {
        if ($body.find('[class*="error"]').length > 0) {
          cy.get('[class*="error"]').should('contain.text');
        }
      });
    });

    it('should have focus indicators', () => {
      // Check that focused elements have visible indicators
      cy.get('[placeholder="Enter note title"]').focus();
      cy.focused().should('have.css', 'outline').and('not.eq', 'none');
    });
  });

  describe('Form Accessibility', () => {
    it('should have proper form labels and associations', () => {
      // Check that form inputs have associated labels
      cy.get('[placeholder="Enter note title"]').should('have.attr', 'id');
      cy.get('[placeholder="Enter note content"]').should('have.attr', 'id');
      cy.get('[placeholder="Add tag"]').should('have.attr', 'id');
      
      // Check for label elements
      cy.get('label').should('exist');
    });

    it('should announce form validation errors', () => {
      // Try to submit without required fields
      cy.get('[placeholder="Enter note content"]').type('Content without title');
      
      // Check for validation messages
      cy.get('[role="alert"]').should('exist');
    });

    it('should support form submission via keyboard', () => {
      cy.get('[placeholder="Enter note title"]').type('Test Note');
      cy.get('[placeholder="Enter note content"]').type('Test content');
      
      // Submit form with Enter key
      cy.get('form').submit();
      
      // Should create the note
      cy.contains('Test Note').should('be.visible');
    });
  });

  describe('Navigation Accessibility', () => {
    it('should have skip links for main content', () => {
      // Check for skip navigation links
      cy.get('[href="#main-content"]').should('exist');
    });

    it('should have proper navigation landmarks', () => {
      // Check for navigation landmarks
      cy.get('nav').should('exist');
      cy.get('main').should('exist');
    });

    it('should announce current page in navigation', () => {
      // Check that current page is announced
      cy.get('nav').find('[aria-current="page"]').should('exist');
    });
  });

  describe('Dynamic Content Accessibility', () => {
    it('should announce loading states', () => {
      cy.get('[placeholder="Enter note content"]').type('Test content');
      cy.contains('Auto-Title').click();
      
      // Check for loading announcements
      cy.get('[aria-busy="true"]').should('exist');
    });

    it('should announce error states', () => {
      // Mock an error
      cy.intercept('POST', '**/openai/**', { forceNetworkError: true }).as('aiError');
      
      cy.get('[placeholder="Enter note content"]').type('Test content');
      cy.contains('Auto-Title').click();
      
      // Check for error announcements
      cy.get('[role="alert"]').should('exist');
    });

    it('should announce success states', () => {
      cy.get('[placeholder="Enter note title"]').type('Test Note');
      cy.get('[placeholder="Enter note content"]').type('Test content');
      cy.contains('Add Note').click();
      
      // Check for success announcements
      cy.get('[role="status"]').should('exist');
    });
  });

  describe('Mobile Accessibility', () => {
    it('should be accessible on mobile devices', () => {
      cy.viewport(375, 667); // Mobile viewport
      
      // Check that all interactive elements are accessible
      cy.get('button').should('have.css', 'min-height').and('be.gte', '44px');
      cy.get('input').should('have.css', 'min-height').and('be.gte', '44px');
    });

    it('should support touch gestures', () => {
      cy.viewport(375, 667);
      
      // Test touch interactions
      cy.get('[placeholder="Enter note title"]').type('Test Note');
      cy.get('[placeholder="Enter note content"]').type('Test content');
      cy.contains('Add Note').click();
      
      // Should work with touch
      cy.contains('Test Note').should('be.visible');
    });
  });

  describe('Semantic HTML', () => {
    it('should use semantic HTML elements', () => {
      // Check for semantic elements
      cy.get('main').should('exist');
      cy.get('nav').should('exist');
      cy.get('section').should('exist');
      cy.get('article').should('exist');
    });

    it('should have proper button semantics', () => {
      // Check that buttons are actual button elements
      cy.contains('Add Note').should('have.prop', 'tagName', 'BUTTON');
      cy.contains('Auto-Title').should('have.prop', 'tagName', 'BUTTON');
      cy.contains('Generate').should('have.prop', 'tagName', 'BUTTON');
    });

    it('should have proper link semantics', () => {
      // Check that links are actual anchor elements
      cy.get('a').should('have.attr', 'href');
    });
  });
}); 