import { render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { describe, it, expect } from 'vitest';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from './form';
import { Input } from './input';

// Minimal test form wrapping shadcn form primitives with a real RHF context.
function TestForm({
  defaultValues = {},
  error,
}: {
  defaultValues?: Record<string, string>;
  error?: string;
}) {
  const form = useForm({ defaultValues });

  // Use an effect to avoid calling setError during render (causes infinite re-render).
  useEffect(() => {
    if (error) {
      form.setError('email', { type: 'manual', message: error });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormDescription>Your account email address.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

describe('Form primitives', () => {
  it('should render FormLabel with correct text', () => {
    render(<TestForm />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('should render FormControl (input) with a placeholder', () => {
    render(<TestForm />);
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('should render FormDescription when no error is present', () => {
    render(<TestForm />);
    expect(screen.getByText('Your account email address.')).toBeInTheDocument();
  });

  it('should render FormMessage when a field error is set', async () => {
    render(<TestForm error="Email is invalid" />);
    await waitFor(() => {
      expect(screen.getByText('Email is invalid')).toBeInTheDocument();
    });
  });

  it('should mark FormControl as aria-invalid when there is an error', async () => {
    render(<TestForm error="Required" />);
    await waitFor(() => {
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });
  });
});
