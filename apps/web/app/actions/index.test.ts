import { describe, it, expect } from 'vitest';

import * as actions from './index';

describe('Public Actions API surface', () => {
  it('should export deleteAccount (soft delete) for account deletion', () => {
    expect(typeof actions.deleteAccount).toBe('function');
  });

  it('should not export deleteUserAccount (hard delete) on the public surface', () => {
    expect('deleteUserAccount' in actions).toBe(false);
  });

  it('should export core auth actions', () => {
    expect(typeof actions.loginUser).toBe('function');
    expect(typeof actions.registerUser).toBe('function');
  });

  it('should export user profile actions', () => {
    expect(typeof actions.getCurrentUserProfile).toBe('function');
    expect(typeof actions.updateUserProfile).toBe('function');
  });
});
