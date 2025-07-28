import Image from 'next/image';
import { useTranslations } from 'next-intl';

export function WelcomeHeader() {
  const t = useTranslations('HomePage');

  return (
    <main className='flex flex-col gap-[32px] row-start-2 items-center sm:items-start'>
      <Image
        className='dark:invert'
        src='/next.svg'
        alt='Next.js logo'
        width={180}
        height={38}
        priority
      />
      <ol className='font-mono list-inside list-decimal text-sm/6 text-center sm:text-left'>
        <li className='mb-2 tracking-[-.01em]'>
          {t('description')}{' '}
          <code className='bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded'>
            src/app/page.tsx
          </code>
          .
        </li>
        <li className='tracking-[-.01em]'>{t('saveChanges')}</li>
      </ol>
    </main>
  );
}
