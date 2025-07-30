import { WelcomeHeader, ActionButtons, Footer, Header } from '@/widgets';
import { LanguageSwitcher } from '@/shared/ui';

type Locale = 'en' | 'uz' | 'ru';

interface HomePageProps {
  locale: Locale;
}

export function HomePage({ locale }: HomePageProps) {
  return (
    <div className='font-sans min-h-screen flex flex-col'>
      <Header locale={locale} />

      <div className='flex-1 grid grid-rows-[1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20'>
        <div className='flex flex-col items-center gap-8'>
          <WelcomeHeader />
          <ActionButtons />
        </div>
        <Footer />
      </div>
    </div>
  );
}
