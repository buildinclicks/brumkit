import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/lib/test/render';
import { VerificationBanner } from './verification-banner';

vi.mock('@/app/actions', () => ({
  resendVerificationEmail: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('VerificationBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the banner with title and description', () => {
    renderWithProviders(<VerificationBanner email="user@example.com" />, {
      disableTheme: true,
    });

    expect(
      screen.getByText(/please verify your email address/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/check your inbox for a verification link/i)
    ).toBeInTheDocument();
  });

  it('should render the resend email button', () => {
    renderWithProviders(<VerificationBanner email="user@example.com" />, {
      disableTheme: true,
    });

    expect(
      screen.getByRole('button', { name: /resend email/i })
    ).toBeInTheDocument();
  });

  it('should be hidden after the dismiss button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<VerificationBanner email="user@example.com" />, {
      disableTheme: true,
    });

    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    await user.click(dismissButton);

    await waitFor(() => {
      expect(
        screen.queryByText(/please verify your email address/i)
      ).not.toBeInTheDocument();
    });
  });

  it('should call resendVerificationEmail with the provided email', async () => {
    const { resendVerificationEmail } = await import('@/app/actions');
    vi.mocked(resendVerificationEmail).mockResolvedValue({ success: true });

    const user = userEvent.setup();
    renderWithProviders(<VerificationBanner email="user@example.com" />, {
      disableTheme: true,
    });

    await user.click(screen.getByRole('button', { name: /resend email/i }));

    expect(resendVerificationEmail).toHaveBeenCalledWith('user@example.com');
  });

  it('should show success toast on successful resend', async () => {
    const { toast } = await import('sonner');
    const { resendVerificationEmail } = await import('@/app/actions');
    vi.mocked(resendVerificationEmail).mockResolvedValue({ success: true });

    const user = userEvent.setup();
    renderWithProviders(<VerificationBanner email="user@example.com" />, {
      disableTheme: true,
    });

    await user.click(screen.getByRole('button', { name: /resend email/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Verification Email Sent',
        expect.any(Object)
      );
    });
  });

  it('should show error toast when resend fails', async () => {
    const { toast } = await import('sonner');
    const { resendVerificationEmail } = await import('@/app/actions');
    vi.mocked(resendVerificationEmail).mockResolvedValue({
      success: false,
      error: 'Rate limit exceeded',
    });

    const user = userEvent.setup();
    renderWithProviders(<VerificationBanner email="user@example.com" />, {
      disableTheme: true,
    });

    await user.click(screen.getByRole('button', { name: /resend email/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
