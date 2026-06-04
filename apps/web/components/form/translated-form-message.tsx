'use client';

import { useFormField } from '@repo/ui/form';
import { cn } from '@repo/ui/lib/utils';
import * as React from 'react';

import { useValidationMessages } from '@/lib/hooks/use-translations';

/**
 * Enhanced FormMessage that automatically translates validation error keys
 */
export const TranslatedFormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const tv = useValidationMessages();

  // If there's no error, just show children
  if (!error) {
    if (!children) return null;

    return (
      <p
        ref={ref}
        id={formMessageId}
        className={cn('text-sm font-medium text-destructive', className)}
        {...props}
      >
        {children}
      </p>
    );
  }

  // Handle translation for Zod errors
  let translatedMessage: string;
  const originalMessage = String(error.message);

  try {
    // Attempt translation
    translatedMessage = tv(originalMessage);

    // Safety check: if translation returns the key itself (prefixed), it wasn't found
    // Some frameworks return "namespace.key" if missing
    if (
      translatedMessage === `validation.${originalMessage}` ||
      translatedMessage === originalMessage
    ) {
      translatedMessage = originalMessage;
    }
  } catch {
    translatedMessage = originalMessage;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      role="alert"
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    >
      {translatedMessage}
    </p>
  );
});

TranslatedFormMessage.displayName = 'TranslatedFormMessage';
