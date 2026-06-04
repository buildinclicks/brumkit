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
import { registerSchema, type RegisterInput } from '@repo/validation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { registerUser } from '@/app/actions';
import { PasswordInput, TranslatedFormMessage } from '@/components/form';
import { getErrorMessage } from '@/lib/api-error';
import { useServerActionForm } from '@/lib/hooks/use-server-action-form';
import { useAuthMessages } from '@/lib/hooks/use-translations';

export default function RegisterPage() {
  const router = useRouter();
  const t = useAuthMessages();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur', // Validate on blur for better UX
    reValidateMode: 'onChange', // Re-validate on change after first blur
  });

  const registerMutation = useServerActionForm(registerUser, {
    setError: form.setError,
    onSuccess: () => {
      toast.success(t('register.success_title'), {
        description: t('register.success_description'),
      });
      router.push('/login');
    },
    onError: (error) => {
      toast.error(t('register.error_title'), {
        description: t(getErrorMessage(error) as Parameters<typeof t>[0]),
      });
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    await registerMutation.mutateAsync(data).catch(() => {
      // Errors handled by mutation's onError callback
    });
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          {t('register.title')}
        </CardTitle>
        <CardDescription>{t('register.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('register.name_label')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('register.name_placeholder')}
                      disabled={registerMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <TranslatedFormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('register.email_label')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('register.email_placeholder')}
                      disabled={registerMutation.isPending}
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
                  <FormLabel>{t('register.password_label')}</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder={t('register.password_placeholder')}
                      disabled={registerMutation.isPending}
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
                  <FormLabel>{t('register.confirm_password_label')}</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder={t('register.confirm_password_placeholder')}
                      disabled={registerMutation.isPending}
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
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending
                ? t('register.submitting')
                : t('register.submit_button')}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground">
          {t('register.already_have_account')}{' '}
          <Link href="/login" className="text-primary hover:underline">
            {t('register.sign_in_link')}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
