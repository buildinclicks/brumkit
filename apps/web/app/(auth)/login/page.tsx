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
import { loginSchema, type LoginInput } from '@repo/validation';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { PasswordInput, TranslatedFormMessage } from '@/components/form';
import { AuthSkeleton } from '@/components/skeletons';
import { getErrorMessage } from '@/lib/api-error';
import { useLogin } from '@/lib/hooks';
import { useAuthMessages } from '@/lib/hooks/use-translations';

function LoginForm() {
  const loginMutation = useLogin();
  const t = useAuthMessages();
  const searchParams = useSearchParams();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: searchParams.get('email') || '',
      password: searchParams.get('password') || '',
    },
  });

  // Update form values if search params change (e.g. from login-demo)
  useEffect(() => {
    const email = searchParams.get('email');
    const password = searchParams.get('password');

    if (email) form.setValue('email', email);
    if (password) form.setValue('password', password);
  }, [searchParams, form]);

  const onSubmit = async (data: LoginInput) => {
    try {
      await loginMutation.mutateAsync(data);
      toast.success(t('login.success'));
    } catch (error: unknown) {
      toast.error(t('login.error_title'), {
        description: getErrorMessage(error),
      });
    }
  };

  const isLoading = loginMutation.isPending;

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">{t('login.title')}</CardTitle>
        <CardDescription>{t('login.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('login.email_label')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('login.email_placeholder')}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <TranslatedFormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>{t('login.password_label')}</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      {t('login.forgot_password')}
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      disabled={isLoading}
                      placeholder={t('login.password_placeholder')}
                    />
                  </FormControl>
                  <TranslatedFormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? t('login.submitting') : t('login.submit_button')}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground">
          {t('login.no_account')}{' '}
          <Link href="/register" className="text-primary hover:underline">
            {t('login.sign_up_link')}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
