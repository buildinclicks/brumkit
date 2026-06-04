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

import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('errors.unauthorized');

  return {
    title: t('title'),
  };
}

export default async function UnauthorizedPage() {
  const t = await getTranslations('errors.unauthorized');

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-6V7a4 4 0 00-8 0v4H3a1 1 0 00-1 1v7a1 1 0 001 1h18a1 1 0 001-1v-7a1 1 0 00-1-1h-1V7a4 4 0 00-8 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t('heading')}</h1>
          <CardDescription className="text-base">
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent />
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/dashboard">{t('back_to_dashboard')}</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">{t('go_home')}</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
