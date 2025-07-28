import { Link } from '@/shared/ui';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('HomePage');

  return (
    <footer className='row-start-3 flex gap-[24px] flex-wrap items-center justify-center'>
      <Link
        href='https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app'
        target='_blank'
        rel='noopener noreferrer'
        icon={{
          src: '/file.svg',
          alt: 'File icon',
          width: 16,
          height: 16,
        }}
      >
        {t('learn')}
      </Link>
      <Link
        href='https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app'
        target='_blank'
        rel='noopener noreferrer'
        icon={{
          src: '/window.svg',
          alt: 'Window icon',
          width: 16,
          height: 16,
        }}
      >
        {t('examples')}
      </Link>
      <Link
        href='https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app'
        target='_blank'
        rel='noopener noreferrer'
        icon={{
          src: '/globe.svg',
          alt: 'Globe icon',
          width: 16,
          height: 16,
        }}
      >
        {t('goToNextjs')}
      </Link>
    </footer>
  );
}
