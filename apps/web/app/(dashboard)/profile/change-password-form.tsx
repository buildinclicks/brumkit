'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@repo/ui/form';
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from '@repo/validation';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { changePassword } from '@/app/actions';
import { PasswordInput } from '@/components/form/password-input';
import { TranslatedFormMessage } from '@/components/form/translated-form-message';
import { getErrorMessage } from '@/lib/api-error';
import { useServerActionForm } from '@/lib/hooks/use-server-action-form';
import { useAuthMessages } from '@/lib/hooks/use-translations';

export function ChangePasswordForm() {
  const tAuth = useAuthMessages();

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const mutation = useServerActionForm(changePassword, {
    setError: form.setError,
    onSuccess: () => {
      toast.success(tAuth('change_password.success_title'), {
        description: tAuth('change_password.success_message'),
      });
      form.reset();
    },
    onError: (error) => {
      toast.error(tAuth('change_password.error_title'), {
        description: getErrorMessage(error),
      });
    },
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    await mutation.mutateAsync(data).catch(() => {
      // Errors handled by mutation's onError callback
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tAuth('change_password.title')}</CardTitle>
        <CardDescription>{tAuth('change_password.subtitle')}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Current Password */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {tAuth('change_password.current_password_label')}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder={tAuth(
                        'change_password.current_password_placeholder'
                      )}
                      disabled={mutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <TranslatedFormMessage />
                </FormItem>
              )}
            />

            {/* New Password */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {tAuth('change_password.new_password_label')}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder={tAuth(
                        'change_password.new_password_placeholder'
                      )}
                      disabled={mutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <TranslatedFormMessage />
                  <FormDescription>
                    {tAuth('change_password.password_hint')}
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* Confirm New Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {tAuth('change_password.confirm_password_label')}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder={tAuth(
                        'change_password.confirm_password_placeholder'
                      )}
                      disabled={mutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <TranslatedFormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t bg-muted/50 px-6 py-4">
            <div className="flex w-full items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Please use 32 characters or fewer.
              </p>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={mutation.isPending}
                >
                  {tAuth('change_password.cancel_button')}
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {mutation.isPending
                    ? tAuth('change_password.submitting')
                    : tAuth('change_password.submit_button')}
                </Button>
              </div>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
