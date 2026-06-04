import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { FormSuccess } from './form-helpers';

describe('FormSuccess', () => {
  it('should render the success message', () => {
    render(<FormSuccess message="Profile saved successfully!" />);
    expect(screen.getByText('Profile saved successfully!')).toBeInTheDocument();
  });

  it('should have role="status" for accessibility', () => {
    render(<FormSuccess message="Done!" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should accept a custom className', () => {
    render(<FormSuccess message="Success" className="custom-class" />);
    expect(screen.getByRole('status')).toHaveClass('custom-class');
  });
});
