import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, it, expect } from 'vitest';

import { Form, FormField, FormItem } from '../ui/form';
import { Input } from '../ui/input';

import { FormFieldWrapper } from './form-helpers';

// FormFieldWrapper uses useFormField() which requires <Form>, <FormField>, and <FormItem> ancestors.
function Wrapper({
  label,
  description,
  required,
  error,
}: {
  label?: string;
  description?: string;
  required?: boolean;
  error?: string;
}) {
  const form = useForm({ defaultValues: { name: '' } });

  if (error) {
    form.setError('name', { type: 'manual', message: error });
  }

  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormFieldWrapper
                label={label}
                description={description}
                required={required}
              >
                <Input {...field} />
              </FormFieldWrapper>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

describe('FormFieldWrapper', () => {
  it('should render the label when provided', () => {
    render(<Wrapper label="Full Name" />);
    expect(screen.getByText('Full Name')).toBeInTheDocument();
  });

  it('should render the required indicator when required is true', () => {
    render(<Wrapper label="Email" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should not render the required indicator when required is false', () => {
    render(<Wrapper label="Bio" required={false} />);
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('should render the description when there is no error', () => {
    render(<Wrapper description="Your full legal name" />);
    expect(screen.getByText('Your full legal name')).toBeInTheDocument();
  });

  it('should render children', () => {
    render(<Wrapper label="Name" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
