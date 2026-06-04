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
  FormField,
  FormItem,
  FormLabel,
} from '@repo/ui/form';
import { Input } from '@repo/ui/input';
import { resetPasswordSchema, type ResetPasswordInput } from '@repo/validation';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { resetPassword } from '@/app/actions';
import { TranslatedFormMessage } from '@/components/form';
import { getErrorMessage } from '@/lib/api-error';
import { useServerActionForm } from '@/lib/hooks/use-server-action-form';
import { useAuthMessages } from '@/lib/hooks/use-translations';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const t = useAuthMessages();

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      token: token || '',
      password: '',
      confirmPassword: '',
    },
  });

  const resetMutation = useServerActionForm(resetPassword, {
    setError: form.setError,
    onSuccess: () => {
      toast.success(t('reset_password.success_toast_title'), {
        description: t('reset_password.success'),
      });
      router.push('/login');
    },
    onError: (error) => {
      toast.error(t('reset_password.error_toast_title'), {
        description: getErrorMessage(error),
      });
    },
  });

  // If no token, show error state
  if (!token) {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-destructive">
            {t('reset_password.invalid_link_title')}
          </CardTitle>
          <CardDescription>{t('reset_password.invalid_token')}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            onClick={() => router.push('/forgot-password')}
            className="w-full cursor-pointer"
          >
            {t('reset_password.request_new_link_button')}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const onSubmit = async (data: ResetPasswordInput) => {
    await resetMutation.mutateAsync(data).catch(() => {
      // Errors handled by mutation's onError callback
    });
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          {t('reset_password.title')}
        </CardTitle>
        <CardDescription>{t('reset_password.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Hidden token field */}
            <input type="hidden" {...form.register('token')} />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('reset_password.password_label')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('reset_password.password_placeholder')}
                      disabled={resetMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <TranslatedFormMessage />
                  <p className="text-xs text-muted-foreground">
                    {t('register.password_hint')}
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('reset_password.confirm_password_label')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t(
                        'reset_password.confirm_password_placeholder'
                      )}
                      disabled={resetMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <TranslatedFormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={resetMutation.isPending}
            >
              {resetMutation.isPending
                ? t('reset_password.submitting')
                : t('reset_password.submit_button')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
