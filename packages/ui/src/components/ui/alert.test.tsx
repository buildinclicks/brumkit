import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Alert, AlertTitle, AlertDescription } from './alert';

describe('Alert', () => {
  it('should render with role alert', () => {
    render(<Alert>Content</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should render with default variant', () => {
    render(<Alert>Default alert</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should render with destructive variant', () => {
    render(<Alert variant="destructive">Error</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });
});

describe('AlertTitle', () => {
  it('should render title text', () => {
    render(
      <Alert>
        <AlertTitle>Alert heading</AlertTitle>
      </Alert>
    );
    expect(screen.getByText('Alert heading')).toBeInTheDocument();
  });
});

describe('AlertDescription', () => {
  it('should render description text', () => {
    render(
      <Alert>
        <AlertDescription>Alert message here</AlertDescription>
      </Alert>
    );
    expect(screen.getByText('Alert message here')).toBeInTheDocument();
  });

  it('should compose Alert with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong.</AlertDescription>
      </Alert>
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  });
});
