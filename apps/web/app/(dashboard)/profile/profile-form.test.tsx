import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import { updateUserProfile } from '@/app/actions';
import { renderWithProviders } from '@/lib/test/render';

import { ProfileForm } from './profile-form';

// Mock the server action
vi.mock('@/app/actions', () => ({
  updateUserProfile: vi.fn(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}));

describe('🔴 RED: ProfileForm Component', () => {
  const mockUser = {
    id: 'user_123',
    name: 'John Doe',
    username: 'johndoe',
    bio: 'Software developer',
    image: 'https://example.com/avatar.jpg',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all form fields with user data', () => {
      renderWithProviders(<ProfileForm user={mockUser} />);

      // Check all fields are rendered
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/bio/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/profile image url/i)).toBeInTheDocument();

      // Check default values
      expect(screen.getByLabelText(/full name/i)).toHaveValue(mockUser.name);
      expect(screen.getByLabelText(/username/i)).toHaveValue(mockUser.username);
      expect(screen.getByLabelText(/bio/i)).toHaveValue(mockUser.bio);
      expect(screen.getByLabelText(/profile image url/i)).toHaveValue(
        mockUser.image
      );
    });

    it('should render submit button', () => {
      renderWithProviders(<ProfileForm user={mockUser} />);

      const submitButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });

    it('should render with empty optional fields', () => {
      const userWithNulls = {
        id: 'user_123',
        name: null,
        username: null,
        bio: null,
        image: null,
      };

      renderWithProviders(<ProfileForm user={userWithNulls} />);

      expect(screen.getByLabelText(/full name/i)).toHaveValue('');
      expect(screen.getByLabelText(/username/i)).toHaveValue('');
      expect(screen.getByLabelText(/bio/i)).toHaveValue('');
      expect(screen.getByLabelText(/profile image url/i)).toHaveValue('');
    });

    it('should show helper text for username and bio', () => {
      renderWithProviders(<ProfileForm user={mockUser} />);

      expect(
        screen.getByText(/your unique username for your profile url/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/brief description for your profile/i)
      ).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation error for invalid username', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ProfileForm user={mockUser} />);

      const usernameInput = screen.getByLabelText(/username/i);
      await user.clear(usernameInput);
      await user.type(usernameInput, 'invalid user!'); // Spaces and special chars

      const submitButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        // Should show validation error with icon from FieldError component
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(
          screen.getByText(/username can only contain/i)
        ).toBeInTheDocument();
      });

      expect(vi.mocked(updateUserProfile)).not.toHaveBeenCalled();
    });

    it('should show validation error for bio exceeding max length', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ProfileForm user={mockUser} />);

      const bioInput = screen.getByLabelText(/bio/i);
      await user.clear(bioInput);
      await user.type(bioInput, 'a'.repeat(501)); // Max is 500

      const submitButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        // Should show validation error with icon from FieldError component
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(vi.mocked(updateUserProfile)).not.toHaveBeenCalled();
    });

    it('should show validation error for invalid image URL', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ProfileForm user={mockUser} />);

      const imageInput = screen.getByLabelText(/profile image url/i);
      await user.clear(imageInput);
      await user.type(imageInput, 'not-a-url');

      const submitButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        // Should show validation error with icon from FieldError component
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(vi.mocked(updateUserProfile)).not.toHaveBeenCalled();
    });

    it('should allow submission with valid data', async () => {
      const user = userEvent.setup();
      vi.mocked(updateUserProfile).mockResolvedValue({ success: true });

      renderWithProviders(<ProfileForm user={mockUser} />);

      const nameInput = screen.getByLabelText(/full name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Jane Smith');

      const submitButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(updateUserProfile)).toHaveBeenCalledWith({
          name: 'Jane Smith',
          username: mockUser.username,
          bio: mockUser.bio,
          image: mockUser.image,
        });
      });
    });
  });

  describe('Form Submission', () => {
    it('should show loading state during submission', async () => {
      const user = userEvent.setup();

      // Mock a delayed response to simulate loading state
      vi.mocked(updateUserProfile).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      );

      renderWithProviders(<ProfileForm user={mockUser} />);

      const nameInput = screen.getByLabelText(/full name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'New Name');

      const submitButton = screen.getByRole('button', {
        name: /save changes/i,
      });

      // Click and immediately check loading state
      user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toHaveTextContent(/saving/i);
        expect(submitButton).toBeDisabled();
      });
    });

    it('should show success toast on successful update', async () => {
      const user = userEvent.setup();
      vi.mocked(updateUserProfile).mockResolvedValue({ success: true });

      renderWithProviders(<ProfileForm user={mockUser} />);

      const nameInput = screen.getByLabelText(/full name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');

      const submitButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Profile updated successfully!'
        );
      });
    });

    it('should show error toast on failed update', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Update failed';
      vi.mocked(updateUserProfile).mockResolvedValue({
        success: false,
        error: errorMessage,
      });

      renderWithProviders(<ProfileForm user={mockUser} />);

      const submitButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Update Failed',
          expect.objectContaining({
            description: expect.any(String),
          })
        );
      });
    });

    it('should display field-level errors from server', async () => {
      const user = userEvent.setup();
      const fieldErrors = {
        username: 'This username is already taken',
      };
      vi.mocked(updateUserProfile).mockResolvedValue({
        success: false,
        error: 'Validation failed',
        fieldErrors: fieldErrors,
      });

      renderWithProviders(<ProfileForm user={mockUser} />);

      const usernameInput = screen.getByLabelText(/username/i);
      await user.clear(usernameInput);
      await user.type(usernameInput, 'takenusername');

      const submitButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('This username is already taken')
        ).toBeInTheDocument();
      });
    });

    it('should submit only changed fields', async () => {
      const user = userEvent.setup();
      vi.mocked(updateUserProfile).mockResolvedValue({ success: true });

      renderWithProviders(<ProfileForm user={mockUser} />);

      const bioInput = screen.getByLabelText(/bio/i);
      await user.clear(bioInput);
      await user.type(bioInput, 'Updated bio');

      const submitButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(updateUserProfile)).toHaveBeenCalledWith({
          name: mockUser.name,
          username: mockUser.username,
          bio: 'Updated bio',
          image: mockUser.image,
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      renderWithProviders(<ProfileForm user={mockUser} />);

      const nameInput = screen.getByLabelText(/full name/i);
      const usernameInput = screen.getByLabelText(/username/i);
      const bioInput = screen.getByLabelText(/bio/i);
      const imageInput = screen.getByLabelText(/profile image url/i);

      expect(nameInput).toHaveAccessibleName();
      expect(usernameInput).toHaveAccessibleName();
      expect(bioInput).toHaveAccessibleName();
      expect(imageInput).toHaveAccessibleName();
    });

    it('should associate error messages with inputs', async () => {
      const user = userEvent.setup();
      const fieldErrors = {
        name: 'Name is required',
      };
      vi.mocked(updateUserProfile).mockResolvedValue({
        success: false,
        error: 'Validation failed',
        fieldErrors: fieldErrors,
      });

      renderWithProviders(<ProfileForm user={mockUser} />);

      const nameInput = screen.getByLabelText(/full name/i);
      await user.clear(nameInput);

      const submitButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        // FieldError component adds role="alert"
        const alerts = screen.getAllByRole('alert');
        expect(alerts.length).toBeGreaterThan(0);
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty image URL (optional field)', async () => {
      const user = userEvent.setup();
      vi.mocked(updateUserProfile).mockResolvedValue({ success: true });

      renderWithProviders(<ProfileForm user={mockUser} />);

      const imageInput = screen.getByLabelText(/profile image url/i);
      await user.clear(imageInput);

      const submitButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(updateUserProfile)).toHaveBeenCalled();
      });

      // Should allow empty image (optional field)
      expect(vi.mocked(updateUserProfile)).toHaveBeenCalledWith(
        expect.objectContaining({
          image: '',
        })
      );
    });

    it('should trim whitespace from inputs', async () => {
      const user = userEvent.setup();
      vi.mocked(updateUserProfile).mockResolvedValue({ success: true });

      renderWithProviders(<ProfileForm user={mockUser} />);

      const nameInput = screen.getByLabelText(/full name/i);
      await user.clear(nameInput);
      await user.type(nameInput, '  Trimmed Name  ');

      const submitButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(updateUserProfile)).toHaveBeenCalledWith(
          expect.objectContaining({
            name: '  Trimmed Name  ', // Should be trimmed by schema
          })
        );
      });
    });
  });
});
