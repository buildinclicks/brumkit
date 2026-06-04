import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderHook } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { QueryClientProvider } from '@tanstack/react-query';

import messages from '@/messages/en.json';
import { createTestQueryClient } from '@/lib/test/render';
import { useValidationMessages, useAuthMessages } from './use-translations';

import type { ReactNode } from 'react';

function wrapper({ children }: { children: ReactNode }) {
  const qc = createTestQueryClient();
  return React.createElement(
    NextIntlClientProvider,
    { locale: 'en', messages },
    React.createElement(QueryClientProvider, { client: qc }, children)
  );
}

describe('useValidationMessages', () => {
  it('should return a translation function', () => {
    const { result } = renderHook(() => useValidationMessages(), { wrapper });
    expect(typeof result.current).toBe('function');
  });

  it('should translate a known validation key', () => {
    const { result } = renderHook(() => useValidationMessages(), { wrapper });
    // 'common.required' should map to the i18n message
    const translated = result.current('common.required');
    expect(typeof translated).toBe('string');
    expect(translated.length).toBeGreaterThan(0);
  });

  it('should normalize "Required" to "common.required"', () => {
    const { result } = renderHook(() => useValidationMessages(), { wrapper });
    const normalized = result.current('Required');
    const direct = result.current('common.required');
    // Both should produce the same result after normalization
    expect(normalized).toBe(direct);
  });

  it('should normalize "Invalid email" to "email.invalid"', () => {
    const { result } = renderHook(() => useValidationMessages(), { wrapper });
    const normalized = result.current('Invalid email');
    const direct = result.current('email.invalid');
    expect(normalized).toBe(direct);
  });

  it('should return a string for unknown keys', () => {
    const { result } = renderHook(() => useValidationMessages(), { wrapper });
    const unknownKey = 'some.unknown.validation.key';
    // next-intl may return a prefixed fallback or the original key;
    // either way the catch block or the t() function returns something string-like
    const returned = result.current(unknownKey);
    expect(typeof returned).toBe('string');
    expect(returned.length).toBeGreaterThan(0);
  });
});

describe('useAuthMessages', () => {
  it('should return a translation function for the auth namespace', () => {
    const { result } = renderHook(() => useAuthMessages(), { wrapper });
    expect(typeof result.current).toBe('function');
    // Should be able to translate a known auth key
    const translated = result.current('login.title' as any);
    expect(typeof translated).toBe('string');
  });
});
