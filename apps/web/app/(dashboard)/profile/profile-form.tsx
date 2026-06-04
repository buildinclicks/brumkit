'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@repo/ui/form';
import { Input } from '@repo/ui/input';
import { Textarea } from '@repo/ui/textarea';
import {
  updateUserProfileSchema,
  type UpdateUserProfileInput,
} from '@repo/validation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { updateUserProfile } from '@/app/actions';
import { TranslatedFormMessage } from '@/components/form/translated-form-message';
import { getErrorMessage } from '@/lib/api-error';
import { useServerActionForm } from '@/lib/hooks/use-server-action-form';

interface ProfileFormProps {
  user: {
    id: string;
    name: string | null;
    username: string | null;
    bio: string | null;
    image: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const t = useTranslations('profile.sections.information');

  const form = useForm<UpdateUserProfileInput>({
    resolver: zodResolver(updateUserProfileSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      name: user.name || '',
      username: user.username || '',
      bio: user.bio || '',
      image: user.image || '',
    },
  });

  const mutation = useServerActionForm(updateUserProfile, {
    setError: form.setError,
    onSuccess: () => {
      toast.success(t('success_toast'));
    },
    onError: (error) => {
      toast.error('Update Failed', {
        description: getErrorMessage(error),
      });
    },
  });

  const onSubmit = async (data: UpdateUserProfileInput) => {
    await mutation.mutateAsync(data).catch(() => {
      // Errors handled by mutation's onError callback
    });
  };

  return (
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
              <FormLabel>{t('name_label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('name_placeholder')}
                  disabled={mutation.isPending}
                  {...field}
                />
              </FormControl>
              <TranslatedFormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('username_label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('username_placeholder')}
                  disabled={mutation.isPending}
                  {...field}
                />
              </FormControl>
              <FormDescription>{t('username_description')}</FormDescription>
              <TranslatedFormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('bio_label')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('bio_placeholder')}
                  rows={4}
                  disabled={mutation.isPending}
                  {...field}
                />
              </FormControl>
              <FormDescription>{t('bio_description')}</FormDescription>
              <TranslatedFormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('image_label')}</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder={t('image_placeholder')}
                  disabled={mutation.isPending}
                  {...field}
                />
              </FormControl>
              <TranslatedFormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? t('submitting') : t('submit_button')}
        </Button>
      </form>
    </Form>
  );
}
