import { Button } from '@repo/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@repo/ui/card';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { GoBackButton } from './go-back-button';

import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('errors.404');

  return {
    title: t('title'),
  };
}

export default async function NotFound() {
  const t = await getTranslations('errors.404');

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <h1 className="text-4xl font-bold tracking-tight">{t('heading')}</h1>
          <CardDescription className="text-base">
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            {t('suggestions')}
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/">{t('go_home')}</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard">{t('go_to_dashboard')}</Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <GoBackButton>{t('go_back')}</GoBackButton>
        </CardFooter>
      </Card>
    </main>
  );
}
