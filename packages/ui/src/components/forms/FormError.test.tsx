import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { FormError } from './form-helpers';

describe('FormError', () => {
  it('should render nothing when neither message nor errors are provided', () => {
    const { container } = render(<FormError />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render a single message', () => {
    render(<FormError message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should have role="alert" for accessibility', () => {
    render(<FormError message="An error occurred" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should render a list of errors', () => {
    render(<FormError errors={['First error', 'Second error']} />);
    expect(screen.getByText('First error')).toBeInTheDocument();
    expect(screen.getByText('Second error')).toBeInTheDocument();
  });

  it('should render both a message and a list of errors', () => {
    render(
      <FormError message="Form failed" errors={['Field A is required']} />
    );
    expect(screen.getByText('Form failed')).toBeInTheDocument();
    expect(screen.getByText('Field A is required')).toBeInTheDocument();
  });

  it('should render nothing when errors is an empty array', () => {
    const { container } = render(<FormError errors={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
