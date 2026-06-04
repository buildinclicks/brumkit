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
import { Checkbox } from '@repo/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@repo/ui/form';
import { Input } from '@repo/ui/input';
import { deleteAccountSchema } from '@repo/validation';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { deleteAccount } from '@/app/actions';
import { TranslatedFormMessage } from '@/components/form/translated-form-message';
import { getErrorMessage } from '@/lib/api-error';
import { useServerActionForm } from '@/lib/hooks/use-server-action-form';
import { useAuthMessages } from '@/lib/hooks/use-translations';

export function DeleteAccountForm() {
  const router = useRouter();
  const tAuth = useAuthMessages();

  // Extend schema with confirmation checkbox
  const deleteAccountFormSchema = deleteAccountSchema.extend({
    confirmation: z.boolean().refine((val) => val === true, {
      message: 'common.required',
    }),
  });

  type DeleteAccountFormInput = z.infer<typeof deleteAccountFormSchema>;

  const form = useForm<DeleteAccountFormInput>({
    resolver: zodResolver(deleteAccountFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      password: '',
      confirmation: false,
    },
  });

  const mutation = useServerActionForm<void, DeleteAccountFormInput>(
    // Wrap the action to transform the data
    async (data: DeleteAccountFormInput) => {
      // Only pass password to server action (confirmation is client-side only)
      return deleteAccount({ password: data.password });
    },
    {
      setError: form.setError,
      onSuccess: () => {
        toast.success(tAuth('delete_account.success_title'), {
          description: tAuth('delete_account.success_message'),
        });
        // Redirect to login after short delay
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      },
      onError: (error) => {
        toast.error(tAuth('delete_account.error_title'), {
          description: getErrorMessage(error),
        });
      },
    }
  );

  const onSubmit = async (data: DeleteAccountFormInput) => {
    if (!data.confirmation) {
      form.setError('confirmation', {
        message: 'common.required',
      });
      return;
    }

    await mutation.mutateAsync(data).catch(() => {
      // Errors handled by mutation's onError callback
    });
  };

  const handleCancel = () => {
    form.reset();
  };

  return (
    <Card className="border-red-200 dark:border-red-900">
      <CardHeader>
        <CardTitle className="text-red-600 dark:text-red-500">
          {tAuth('delete_account.title')}
        </CardTitle>
        <CardDescription>{tAuth('delete_account.subtitle')}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md p-4">
              <div className="flex items-center gap-2 mb-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm font-semibold">
                  {tAuth('delete_account.warning_title')}
                </p>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400">
                {tAuth('delete_account.warning_message')}
              </p>
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {tAuth('delete_account.password_label')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={tAuth('delete_account.password_placeholder')}
                      disabled={mutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {tAuth('delete_account.password_hint')}
                  </FormDescription>
                  <TranslatedFormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/50">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={mutation.isPending}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      {tAuth('delete_account.checkbox_label')}
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="bg-muted/50 dark:bg-muted/20 border border-border/50 rounded-md p-4">
              <p className="text-sm font-medium mb-2">
                {tAuth('delete_account.confirmation_modal_title')}
              </p>
              <p className="text-sm font-medium mb-1">
                {tAuth('delete_account.grace_period_title')}
              </p>
              <p className="text-sm text-muted-foreground">
                {tAuth('delete_account.grace_period_info')}
              </p>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-red-50/50 dark:bg-red-950/10 px-6 py-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={mutation.isPending}
            >
              {tAuth('delete_account.cancel_button')}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={mutation.isPending || !form.watch('confirmation')}
            >
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {mutation.isPending
                ? tAuth('delete_account.submitting')
                : tAuth('delete_account.submit_button')}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
