import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock the external dependencies that require browser APIs
vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

vi.mock('sonner', () => ({
  Toaster: ({
    className,
    ...props
  }: {
    className?: string;
    [key: string]: unknown;
  }) => <div data-testid="toaster" className={className} {...props} />,
}));

import { Toaster } from './sonner';

describe('Toaster', () => {
  it('should render without crashing', () => {
    const { getByTestId } = render(<Toaster />);
    expect(getByTestId('toaster')).toBeInTheDocument();
  });

  it('should pass through className prop', () => {
    const { getByTestId } = render(<Toaster />);
    const el = getByTestId('toaster');
    expect(el.className).toContain('toaster');
  });
});
