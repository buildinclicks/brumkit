import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PasswordInput } from './password-input';

describe('PasswordInput', () => {
  it('should render as a password type field by default', () => {
    const { container } = render(<PasswordInput aria-label="Password" />);
    expect(container.querySelector('input[type="password"]')).toBeTruthy();
  });

  it('should have accessible label for the toggle button', () => {
    render(<PasswordInput aria-label="Password" />);
    expect(
      screen.getByRole('button', { name: /show password/i })
    ).toBeInTheDocument();
  });

  it('should toggle visibility from password to text when toggle is clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<PasswordInput aria-label="Password" />);

    const toggle = screen.getByRole('button', { name: /show password/i });
    await user.click(toggle);

    expect(container.querySelector('input[type="text"]')).toBeTruthy();
    expect(container.querySelector('input[type="password"]')).not.toBeTruthy();
  });

  it('should toggle back to password type on second click', async () => {
    const user = userEvent.setup();
    const { container } = render(<PasswordInput aria-label="Password" />);

    const toggle = screen.getByRole('button', { name: /show password/i });
    await user.click(toggle);
    await user.click(screen.getByRole('button', { name: /hide password/i }));

    expect(container.querySelector('input[type="password"]')).toBeTruthy();
  });

  it('should update the accessible label on the toggle button after toggling', async () => {
    const user = userEvent.setup();
    render(<PasswordInput aria-label="Password" />);

    await user.click(screen.getByRole('button', { name: /show password/i }));
    expect(
      screen.getByRole('button', { name: /hide password/i })
    ).toBeInTheDocument();
  });

  it('should be disabled when the disabled prop is set', () => {
    render(<PasswordInput disabled aria-label="Password" />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should accept custom show/hide labels', () => {
    render(
      <PasswordInput
        aria-label="Password"
        showPasswordLabel="Reveal"
        hidePasswordLabel="Conceal"
      />
    );
    expect(screen.getByRole('button', { name: 'Reveal' })).toBeInTheDocument();
  });
});
