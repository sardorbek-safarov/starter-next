import { Button } from '@/shared/ui';
import { useTranslations } from 'next-intl';

export function ActionButtons() {
  const t = useTranslations('HomePage');

  return (
    <div className='flex gap-4 items-center flex-col sm:flex-row'>
      <Button
        href='https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app'
        variant='primary'
        target='_blank'
        rel='noopener noreferrer'
        icon={{
          src: '/vercel.svg',
          alt: 'Vercel logomark',
          width: 20,
          height: 20,
        }}
      >
        {t('deployNow')}
      </Button>
      <Button
        href='https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app'
        variant='secondary'
        target='_blank'
        rel='noopener noreferrer'
      >
        {t('readDocs')}
      </Button>
    </div>
  );
}
