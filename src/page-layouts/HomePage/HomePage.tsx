import { WelcomeHeader, ActionButtons, Footer } from '@/widgets';
import { LanguageSwitcher } from '@/shared/ui';
import { type Locale } from '@/shared/config/i18n';

interface HomePageProps {
  locale: Locale;
}

export function HomePage({ locale }: HomePageProps) {
  return (
    <div className='font-sans grid grid-rows-[60px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20'>
      <div className='w-full flex justify-end'>
        <LanguageSwitcher currentLocale={locale} />
      </div>
      <div className='flex flex-col items-center gap-8'>
        <WelcomeHeader />
        <ActionButtons />
      </div>
      <Footer />
    </div>
  );
}
