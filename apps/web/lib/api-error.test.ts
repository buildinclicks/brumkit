import { describe, it, expect, vi } from 'vitest';
import { ErrorCode } from '@repo/types';

import {
  ApiError,
  parseApiError,
  isApiError,
  getErrorMessage,
  formatValidationErrors,
} from './api-error';

describe('ApiError', () => {
  it('should create an ApiError with message and status code', () => {
    const error = new ApiError('Not found', 404);

    expect(error.message).toBe('Not found');
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe('ApiError');
    expect(error.code).toBe(ErrorCode.UNKNOWN_ERROR);
  });

  it('should create an ApiError with a specific error code', () => {
    const error = new ApiError(
      'Unauthorized',
      401,
      ErrorCode.AUTH_UNAUTHORIZED
    );

    expect(error.code).toBe(ErrorCode.AUTH_UNAUTHORIZED);
    expect(error.statusCode).toBe(401);
  });

  it('should create an ApiError with validation fields', () => {
    const fields = [{ field: 'email', message: 'Invalid email' }];
    const error = new ApiError(
      'Validation failed',
      422,
      ErrorCode.VALIDATION_FAILED,
      fields
    );

    expect(error.fields).toEqual(fields);
  });

  it('should extend Error', () => {
    const error = new ApiError('test', 500);
    expect(error).toBeInstanceOf(Error);
  });

  describe('isValidationError', () => {
    it('should return true when code is VALIDATION_FAILED and fields exist', () => {
      const error = new ApiError(
        'Validation failed',
        422,
        ErrorCode.VALIDATION_FAILED,
        [{ field: 'email', message: 'Required' }]
      );

      expect(error.isValidationError()).toBe(true);
    });

    it('should return false when code is VALIDATION_FAILED but no fields', () => {
      const error = new ApiError(
        'Validation failed',
        422,
        ErrorCode.VALIDATION_FAILED
      );
      expect(error.isValidationError()).toBe(false);
    });

    it('should return false for non-validation errors', () => {
      const error = new ApiError('Server error', 500);
      expect(error.isValidationError()).toBe(false);
    });
  });

  describe('isAuthError', () => {
    it('should return true for AUTH_INVALID_CREDENTIALS', () => {
      const error = new ApiError(
        'Invalid',
        401,
        ErrorCode.AUTH_INVALID_CREDENTIALS
      );
      expect(error.isAuthError()).toBe(true);
    });

    it('should return true for AUTH_UNAUTHORIZED', () => {
      const error = new ApiError(
        'Unauthorized',
        401,
        ErrorCode.AUTH_UNAUTHORIZED
      );
      expect(error.isAuthError()).toBe(true);
    });

    it('should return false for non-auth errors', () => {
      const error = new ApiError('Not found', 404);
      expect(error.isAuthError()).toBe(false);
    });
  });

  describe('getFieldError', () => {
    it('should return error message for a specific field', () => {
      const error = new ApiError(
        'Validation failed',
        422,
        ErrorCode.VALIDATION_FAILED,
        [{ field: 'email', message: 'Invalid email format' }]
      );

      expect(error.getFieldError('email')).toBe('Invalid email format');
    });

    it('should return undefined for fields that do not exist', () => {
      const error = new ApiError(
        'Validation failed',
        422,
        ErrorCode.VALIDATION_FAILED,
        []
      );
      expect(error.getFieldError('nonexistent')).toBeUndefined();
    });

    it('should return undefined when no fields are set', () => {
      const error = new ApiError('test', 500);
      expect(error.getFieldError('email')).toBeUndefined();
    });
  });

  describe('getFieldErrors', () => {
    it('should return a map of field errors', () => {
      const error = new ApiError(
        'Validation failed',
        422,
        ErrorCode.VALIDATION_FAILED,
        [
          { field: 'email', message: 'Invalid email' },
          { field: 'password', message: 'Too short' },
        ]
      );

      expect(error.getFieldErrors()).toEqual({
        email: 'Invalid email',
        password: 'Too short',
      });
    });

    it('should return empty object when no fields', () => {
      const error = new ApiError('test', 500);
      expect(error.getFieldErrors()).toEqual({});
    });
  });
});

describe('parseApiError', () => {
  it('should parse a structured API error response', async () => {
    const mockResponse = {
      status: 422,
      json: vi.fn().mockResolvedValue({
        error: {
          message: 'Validation failed',
          code: ErrorCode.VALIDATION_FAILED,
          fields: [{ field: 'email', message: 'Required' }],
        },
      }),
    } as unknown as Response;

    const error = await parseApiError(mockResponse);

    expect(error.message).toBe('Validation failed');
    expect(error.statusCode).toBe(422);
    expect(error.code).toBe(ErrorCode.VALIDATION_FAILED);
    expect(error.fields).toHaveLength(1);
  });

  it('should handle non-JSON responses gracefully', async () => {
    const mockResponse = {
      status: 500,
      statusText: 'Internal Server Error',
      json: vi.fn().mockRejectedValue(new SyntaxError('Invalid JSON')),
    } as unknown as Response;

    const error = await parseApiError(mockResponse);

    expect(error.message).toBe('Internal Server Error');
    expect(error.statusCode).toBe(500);
  });

  it('should handle non-standard error response format', async () => {
    const mockResponse = {
      status: 400,
      json: vi.fn().mockResolvedValue({ message: 'Bad request' }),
    } as unknown as Response;

    const error = await parseApiError(mockResponse);

    expect(error.message).toBe('Bad request');
    expect(error.statusCode).toBe(400);
  });

  it('should fallback message when json has no message', async () => {
    const mockResponse = {
      status: 400,
      json: vi.fn().mockResolvedValue({}),
    } as unknown as Response;

    const error = await parseApiError(mockResponse);

    expect(error.message).toBe('An error occurred');
  });
});

describe('isApiError', () => {
  it('should return true for ApiError instances', () => {
    const error = new ApiError('test', 500);
    expect(isApiError(error)).toBe(true);
  });

  it('should return false for regular Error', () => {
    expect(isApiError(new Error('test'))).toBe(false);
  });

  it('should return false for non-errors', () => {
    expect(isApiError('error string')).toBe(false);
    expect(isApiError(null)).toBe(false);
    expect(isApiError(undefined)).toBe(false);
  });
});

describe('getErrorMessage', () => {
  it('should extract message from ApiError', () => {
    const error = new ApiError('API error message', 500);
    expect(getErrorMessage(error)).toBe('API error message');
  });

  it('should extract message from regular Error', () => {
    expect(getErrorMessage(new Error('regular error'))).toBe('regular error');
  });

  it('should return string errors as-is', () => {
    expect(getErrorMessage('string error')).toBe('string error');
  });

  it('should return fallback for unknown error types', () => {
    expect(getErrorMessage(42)).toBe('An unexpected error occurred');
    expect(getErrorMessage(null)).toBe('An unexpected error occurred');
  });
});

describe('formatValidationErrors', () => {
  it('should return field errors for ApiError with validation errors', () => {
    const error = new ApiError(
      'Validation failed',
      422,
      ErrorCode.VALIDATION_FAILED,
      [{ field: 'email', message: 'Invalid' }]
    );

    expect(formatValidationErrors(error)).toEqual({ email: 'Invalid' });
  });

  it('should return null for non-validation errors', () => {
    const error = new ApiError('Server error', 500);
    expect(formatValidationErrors(error)).toBeNull();
  });

  it('should return null for non-ApiError values', () => {
    expect(formatValidationErrors(new Error('test'))).toBeNull();
    expect(formatValidationErrors(null)).toBeNull();
  });
});
