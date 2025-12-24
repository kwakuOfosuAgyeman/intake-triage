// backend/tests/classifier.test.js
import { describe, it, expect } from 'vitest';
import { classifyIntake } from '../src/services/classifier.js';

describe('Heuristic Classifier', () => {
  describe('Billing classification', () => {
    it('classifies invoice-related requests', () => {
      expect(classifyIntake('I need help with my invoice')).toBe('billing');
      expect(classifyIntake('Invoice payment issue')).toBe('billing');
    });

    it('classifies payment-related requests', () => {
      expect(classifyIntake('Payment problem with credit card')).toBe('billing');
      expect(classifyIntake('Cannot complete payment')).toBe('billing');
    });

    it('classifies refund requests', () => {
      expect(classifyIntake('Refund request for overcharge')).toBe('billing');
      expect(classifyIntake('I was charged twice, need refund')).toBe('billing');
    });

    it('classifies subscription issues', () => {
      expect(classifyIntake('Subscription billing question')).toBe('billing');
      expect(classifyIntake('Cancel my subscription')).toBe('billing');
    });
  });

  describe('Technical Support classification', () => {
    it('classifies login issues', () => {
      expect(classifyIntake('Login error 500')).toBe('technical_support');
      expect(classifyIntake('Cannot login to my account')).toBe('technical_support');
    });

    it('classifies access problems', () => {
      expect(classifyIntake('Cannot access my dashboard')).toBe('technical_support');
      expect(classifyIntake('Can\'t access the system')).toBe('technical_support');
    });

    it('classifies bug reports', () => {
      expect(classifyIntake('Found a bug in the application')).toBe('technical_support');
      expect(classifyIntake('Error message when clicking submit')).toBe('technical_support');
    });

    it('classifies system errors', () => {
      expect(classifyIntake('Getting 404 error')).toBe('technical_support');
      expect(classifyIntake('Website is down')).toBe('technical_support');
    });
  });

  describe('New Matter/Project classification', () => {
    it('classifies quote requests', () => {
      expect(classifyIntake('Request a quote for new project')).toBe('new_matter_project');
      expect(classifyIntake('Need pricing quote')).toBe('new_matter_project');
    });

    it('classifies consultation requests', () => {
      expect(classifyIntake('Schedule consultation for engagement')).toBe('new_matter_project');
      expect(classifyIntake('Want to hire for new project')).toBe('new_matter_project');
    });

    it('classifies project proposals', () => {
      expect(classifyIntake('Proposal for new engagement')).toBe('new_matter_project');
      expect(classifyIntake('Start new project contract')).toBe('new_matter_project');
    });
  });

  describe('Other classification', () => {
    it('defaults to other for ambiguous text', () => {
      expect(classifyIntake('Hello')).toBe('other');
      expect(classifyIntake('General question')).toBe('other');
      expect(classifyIntake('Just saying hi')).toBe('other');
    });

    it('handles empty or minimal text', () => {
      expect(classifyIntake('test')).toBe('other');
      expect(classifyIntake('a b c')).toBe('other');
    });
  });

  describe('Edge cases', () => {
    it('handles case insensitivity', () => {
      expect(classifyIntake('INVOICE PROBLEM')).toBe('billing');
      expect(classifyIntake('LoGiN ErRoR')).toBe('technical_support');
    });

    it('handles multiple category keywords', () => {
      // Should pick strongest match
      const result = classifyIntake('I have an invoice payment error');
      expect(['billing', 'technical_support']).toContain(result);
    });

    it('handles extra whitespace', () => {
      expect(classifyIntake('  invoice   help  ')).toBe('billing');
    });
  });
});