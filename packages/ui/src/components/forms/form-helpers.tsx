'use client';

import * as React from 'react';

import { cn } from '../../lib/utils';
import { useFormField } from '../ui/form';

/**
 * FormFieldWrapper - Wraps label, input, and error message
 */
export interface FormFieldWrapperProps {
  label?: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormFieldWrapper({
  label,
  description,
  required,
  children,
  className,
}: FormFieldWrapperProps) {
  const { error } = useFormField();

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      {children}
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm font-medium text-destructive">{error.message}</p>
      )}
    </div>
  );
}

/**
 * FormError - Display form-level errors
 */
export interface FormErrorProps {
  message?: string;
  errors?: string[];
  className?: string;
}

export function FormError({ message, errors, className }: FormErrorProps) {
  if (!message && (!errors || errors.length === 0)) {
    return null;
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive',
        className
      )}
      role="alert"
    >
      {message && <p className="font-medium">{message}</p>}
      {errors && errors.length > 0 && (
        <ul className="mt-2 list-disc list-inside space-y-1">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * FormSuccess - Display success messages
 */
export interface FormSuccessProps {
  message: string;
  className?: string;
}

export function FormSuccess({ message, className }: FormSuccessProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-sm text-green-700 dark:text-green-400',
        className
      )}
      role="status"
    >
      <p className="font-medium">{message}</p>
    </div>
  );
}
